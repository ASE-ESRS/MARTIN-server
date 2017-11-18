import csv
import requests, json
import os, time, threading
from datetime import datetime
from multiprocessing.dummy import Pool as ThreadPool

print 'Opening InputDataset.csv'
inputDataset = open('data/InputDataset.csv', 'r')
reader = csv.reader(inputDataset)

numberOfEntries = int(os.popen('wc -l < data/InputDataset.csv').read()[:-1])

# Counters to track progress.
batchCount = 0
processedCount = 0

# A generator to fetch the next batch (of 100 entries) to be procesesed.
def getNextBatch():
    # A dictionary containing a batch of 100 entries to process, indexed by postcode.
    # Limited to 100 as that is the API max batch convertion size.
    batch = {}

    for row in reader:
        # Extract the necessary entry information.
        price = row[1]
        dateTime = row[2]
        postcode = row[3]

        #  Strip time from date.
        date = dateTime.split(' ')[0];

        # If an entry for this postcode doesn't exist in the batch already, add it.
        if batch.get(postcode) == None:
            # Make a dictionary of postcode to price pairings (used to join price back to entry later and for the API call).
            batch[postcode] = (price, date)
        else:
            # Otherwise, check whether this one is newer and replace it if it is.
            if datetime.strptime(date, "%d/%m/%Y") > datetime.strptime(batch[postcode][1], "%d/%m/%Y"):
                batch[postcode] = (price, date)

        # Check whether the batch is maximum size yet (100).
        if len(batch) >= 100:
            # Note: a copy is made to avoid inteference between threads.
            yield dict(batch)

            # Clear the batch list ready for the next thread.
            batch = {}

    # If there're any left over entries to send, send them.
    if len(batch) > 0:
        yield dict(batch)

# Responsible for proceessing the supplied batch. Includes making API call and calling writeEntries()).
def processBatch(batchToProcess):
    # Make an API request to convert these postcodes (this is a blocking call).
    request = requests.post("http://api.postcodes.io/postcodes/", json = {"postcodes" : batchToProcess.keys()})
    response = request.json()

    # Ensure we recieved a HTTP OK response
    if response["status"] != 200:
        print 'ERR: Batch', batchNumber, "response failed"
        return

    entries = []

    for result in response["result"]:
        if result["query"] == "" or result["result"] is None:
            # Ignoring empty result.
            continue

        postcode = result["query"]

        longitude = result["result"]["longitude"]
        latitude = result["result"]["latitude"]

        price = batchToProcess[postcode][0]
        date = batchToProcess[postcode][1]

        locationPriceEntry = {
            'postcode' : postcode,
            'latitude' : latitude,
            'longitude' : longitude,
            'price' : price,
            'entryDate' : date
        }

        entries.append(locationPriceEntry)

    writeEntries(entries)

# Make a POST request to update the DynamoDB table.
# Increments and reports the progress counters.
def writeEntries(entries):
    request = requests.post('https://4wmuzhlr5b.execute-api.eu-west-2.amazonaws.com/prod/storeLocationPrice', json = {"entries" : entries})

    # Increment the progress reporting variables.
    global processedCount
    processedCount += len(entries)

    global batchCount
    batchCount += 1

    reportProgressIfRequired()

# The progress that was last reported (initially 0%).
previousReport = 0

# Reports (prints) the current progress to the user every 1%.
def reportProgressIfRequired():
    global previousReport
    currentProgress = int(round(100 * processedCount / numberOfEntries))
    if currentProgress >= previousReport + 1:
        print currentProgress, "%"
        previousReport = currentProgress

startTime = time.time()

print 'Processing postcodes...\n'

# We use 8 threads to attempt to aleviate the bottleneck caused by network I/O.
threads = ThreadPool(processes = 8)

batchGenerator = getNextBatch()

threads.map(processBatch, batchGenerator)

threads.close()
threads.join()

stopTime = time.time()
elapsedTime = stopTime - startTime

print "\n", processedCount, "entries,", batchCount, "batches, processed in ", round(elapsedTime), "seconds"
