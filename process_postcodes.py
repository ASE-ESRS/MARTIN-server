import csv
import requests, json
import time
# import threading

print 'Opening InputDataset.csv'
inputDataset = open('MonthlyInputDataset.csv', 'r')
reader = csv.reader(inputDataset)

print 'Opening OutputDataset.csv\n'
outputDataset = open('OutputDataset.csv', 'w')
writer = csv.writer(outputDataset, delimiter=',')

def processInput():
    # Counters to track progress.
    batchNumber = 1
    processedCount = 0

    # A dictionary containing a batch of 100 entries to process, indexed by postcode.
    # Limited to 100 as that is the API max batch convertion size.
    batch = {}

    # Used for progress reporting.
    lastPercentShown = 0

    for row in reader:
        # Extract the necessary entry information.
        price = row[1]
        date = row[2]
        postcode = row[3]

        # Add the entry to the batch.
        # Make a dictionary of postcode to price pairings (used to join price back to entry later and for the API call).
        batch[postcode] = (price, date)

        # Check whether the batch is maximum size yet (100).
        if len(batch) >= 100:
            # Note: we make a copy so the threads don't intefer with eachother.
            processBatch(dict(batch), batchNumber, processedCount)

            # The following code was used to dispatch async tasks but is no longer used.
            # This is because the server rejects more than 1 request per second, so it's not neeeded.
            #     async_thread = threading.Thread(target=longProcess, args=[input], kwargs={})
            #     async_thread.start()

            # Clear the batch list ready for the next thread.
            processedCount += 100
            batch = {}

            # Progress reporting
            if processedCount >= 350000:
                if 100 > lastPercentShown:
                    print '100%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 100
            elif processedCount >= 315000:
                if 90 > lastPercentShown:
                    print '90%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 90
            elif processedCount >= 280000:
                if 80 > lastPercentShown:
                    print '80%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 80
            elif processedCount >= 245000:
                if 70 > lastPercentShown:
                    print '70%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 70
            elif processedCount >= 210000:
                if 60 > lastPercentShown:
                    print '60%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 60
            elif processedCount >= 175000:
                if 50 > lastPercentShown:
                    print '50%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 50
            elif processedCount >= 140000:
                if 40 > lastPercentShown:
                    print '40%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 40
            elif processedCount >= 105000:
                if 30 > lastPercentShown:
                    print '30%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 30
            elif processedCount >= 70000:
                if 20 > lastPercentShown:
                    print '20%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 20
            elif processedCount >= 35000:
                if 10 > lastPercentShown:
                    print '10%', '-', processedCount, "entries,", batchNumber, "batches\n"
                    lastPercentShown = 10

            batchNumber += 1

    # If there're any left over entries to send.
    if len(batch) > 0:
        processBatch(dict(batch), batchNumber, processedCount)

    return (batchNumber, processedCount)
def processBatch(batchToProcess, batchNumber, processedCount):
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
            # Ignoring empty result'
            continue

        longitude = result["result"]["longitude"]
        latitude = result["result"]["latitude"]
        postcode = result["query"]
        price = batchToProcess[postcode][0]
        date = batchToProcess[postcode][1]

        rowsToWrite.append([longitude, latitude, postcode, price, date])

    writer.writerows(rowsToWrite)

startTime = time.time()

print 'Processing postcodes...\n'

info = processInput()

batchCount = info[0] - 1
processedCount = info[1]

stopTime = time.time()

elapsedTime = stopTime - startTime

print "\n", processedCount, "entries,", batchCount, "batches, processed in ", elapsedTime, "seconds"
