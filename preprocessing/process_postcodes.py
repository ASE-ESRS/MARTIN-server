import csv
import requests, json
import os, time, threading
from multiprocessing.pool import ThreadPool as Pool

# This prevents multiple threads from intefering with oneanother while writing.
csvWriteLock = threading.Lock()

print 'Data/Opening InputDataset.csv'
inputDataset = open('Data/InputDataset.csv', 'r')
reader = csv.reader(inputDataset)

numberOfEntries = int(os.popen('wc -l < Data/InputDataset.csv').read()[:-1])

print 'Opening OutputDataset.csv\n'
outputDataset = open('Data/OutputDataset.csv', 'w')
writer = csv.writer(outputDataset, delimiter=',')

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
        date = row[2]
        postcode = row[3]

        # Make a dictionary of postcode to price pairings (used to join price back to entry later and for the API call).
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

# Responsible for proceessing the supplied batch. Includes making API call and calling writeRows().
def processBatch(batchToProcess):
    # Make an API request to convert these postcodes (this is a blocking call).
    request = requests.post("http://api.postcodes.io/postcodes/", json = {"postcodes" : batchToProcess.keys()})
    response = request.json()

    # Ensure we recieved a HTTP OK response
    if response["status"] != 200:
        print 'ERR: Batch', batchNumber, "response failed"
        return

    rowsToWrite = []

    for result in response["result"]:
        if result["query"] == "" or result["result"] is None:
            # Ignoring empty result.
            continue

        longitude = result["result"]["longitude"]
        latitude = result["result"]["latitude"]
        postcode = result["query"]
        price = batchToProcess[postcode][0]
        date = batchToProcess[postcode][1]

        rowsToWrite.append([longitude, latitude, postcode, price, date])

    writeRows(rowsToWrite)

# Writes the supplied rows to the output CSV file.
# Increments and reports the progress counters.
def writeRows(rowsToWrite):
    # Require the lock to write to the CSV.
    with csvWriteLock:
        writer.writerows(rowsToWrite)

    # Increment the progress reporting variables.
    global processedCount
    processedCount += len(rowsToWrite)

    global batchCount
    batchCount += 1

    reportProgressIfRequired()

# The progress that was last reported (initially 0%).
previousReport = 0

# Reports (prints) the current progress to the user every ~10%.
def reportProgressIfRequired():
    global previousReport
    currentProgress = int(round(100 * processedCount / numberOfEntries))
    if currentProgress >= previousReport + 5:
        print currentProgress, "%"
        previousReport = currentProgress

startTime = time.time()

print 'Processing postcodes...\n'

# We use 4 threads to attempt to aleviate the bottleneck caused by network I/O.
threads = Pool(processes = 4)

batchGenerator = getNextBatch()

for batch in batchGenerator:
    threads.map(processBatch, (batch,))

threads.close()
threads.join()

stopTime = time.time()
elapsedTime = stopTime - startTime

print "\n", processedCount, "entries,", batchCount, "batches, processed in ", round(elapsedTime), "seconds"
