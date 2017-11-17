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
            date        : entry.date
        };

        isLastEntry = index == entries.count - 1;

        // Insert a new record into the `price_paid_data` DynamoDB table.
        saveItem(pricePaidItem, isLastEntry, callback);
    }
};

// Saves the specified item to DynamoDB.
// If this is the last entry, the callback is used to return control to the client.
function saveItem(itemToSave, isLastEntry, callback) {
    // TODO: Check whether an entry for this postcode is already in the DB.
    dynamodb.putItem({
        "TableName" : k_TABLE_NAME,
        "Item"      : itemToSave
    }, function (result) {
        console.log(result);
    });

    if isLastEntry {
        callback(null, {
            "statusCode" : 200,
            "headers" : { "Content-Type" : "application/json" },
            "body" : JSON.stringify({
                "status" : "success"
            })
        });
    }
}
