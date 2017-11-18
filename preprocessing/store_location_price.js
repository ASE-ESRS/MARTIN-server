// This Lambda function is called by the `process_postcodes.py` script.
// It inserts an entry (postcode, latitude, longitude, price, date) in the table.
//
// The price-paid data table can be viewed here:
// https://eu-west-2.console.aws.amazon.com/dynamodb/home?region=eu-west-2#tables:selected=price_paid_data


var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

// Name of the locations table in DynamoDB.
let k_TABLE_NAME = "price_paid_data";

// This function is called when the Lambda function is invoked.
// The function is invoked for each batch.
exports.handler = (event, context, callback) => {
    let jsonPayload = JSON.parse(event.body);
    let entries = jsonPayload.entries;

    for (var index in entries) {
        let entry = entries[index];

        // Create the new price-paid entry item.
        var pricePaidItem = {
            postcode    : entry.postcode,
            longitude   : parseFloat(entry.longitude),
            latitude    : parseFloat(entry.latitude),
            price       : entry.price,
            entryDate   : entry.entryDate
        };

        isLastEntry = index == entries.length - 1;

        // Insert a new record into the `price_paid_data` DynamoDB table.
        saveItem(pricePaidItem, isLastEntry, callback);
    }
};

// Saves the specified item to DynamoDB.
// If this is the last entry, the callback is used to return control to the client.
function saveItem(itemToSave, isLastEntry, callback) {
    // Check whether an entry for this postcode is already in the DB.
    dynamodb.getItem({
        TableName   : k_TABLE_NAME,
        Key         : { postcode : itemToSave.postcode }
    }, function (error, result) {
        if (typeof result != 'undefined' && typeof result.Item != 'undefined') {
            // If it is, then only update the value if this item has a newer dateTime.
            updateExistingItemIfNecessary(result, itemToSave, isLastEntry, callback);
        } else {
            // Otherwise, simply save the entry.
            putNewItem(itemToSave, isLastEntry, callback);
        }
    });
}

// Saves the item in the database and calls the response function if it's the last one.
function putNewItem(itemToSave, isLastEntry, callback) {
    dynamodb.putItem({
        TableName : k_TABLE_NAME,
        Item      : itemToSave
    }, function (result) {
        if (isLastEntry) {
            returnResponse(callback);
        }
    });
}

// If this entry is newer than the saved one, update it.
function updateExistingItemIfNecessary(savedItem, itemToSave, isLastEntry, callback) {
    if (Date.parse(itemToSave.entryDate) > Date.parse(savedItem.Item.entryDate)) {
        dynamodb.updateItem({
            TableName           : k_TABLE_NAME,
            Key                 : { postcode : itemToSave.postcode },
            UpdateExpression    : "set price = :p, entryDate = :d",
            ExpressionAttributeValues : {
                ':p'    :   itemToSave.price,
                ':d'    :   itemToSave.entryDate
            },
            ReturnValues        : "UPDATED_NEW"
        }, function (result) {
            if (isLastEntry) {
                returnResponse(callback);
            }
        });
    } else {
        if (isLastEntry) {
            returnResponse(callback);
        }
    }
}

// Responds to the client informing them that the operation was successful.
function returnResponse(callback) {
    callback(null, {
        "statusCode" : 200,
        "headers" : { "Content-Type" : "application/json" },
        "body" : JSON.stringify({
            "succeeded" : true
        })
    });
}
