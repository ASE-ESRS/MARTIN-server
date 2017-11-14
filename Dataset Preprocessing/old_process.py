import csv
import requests, json

print 'Opening InputDataset.csv'
inputDataset = open('InputDataset.csv', 'r')
reader = csv.reader(inputDataset)

print 'Opening OutputDataset.csv'
outputDataset = open('OutputDataset.csv', 'w')
writer = csv.writer(outputDataset, delimiter=',')

print 'Extracting postcodes and prices'
for row in reader:
    price = row[1]
    date = row[2]
    postcode = row[3]

    request = requests.get("http://api.postcodes.io/postcodes/" + postcode).json()

    latitude = request["result"]["latitude"]
    longitude = request["result"]["longitude"]

    writer.writerow([postcode, latitude, longitude, price, date])

print 'Done'
