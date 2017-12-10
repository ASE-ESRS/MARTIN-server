// Name of the request_logs table in DynamoDB.
let k_TABLE_NAME = "request_logs";

function createLogEntry(requestLogID) {
    var doc = require('dynamodb-doc');
    var dynamoDB = new doc.DynamoDB();

    // Make a note of the current time.
    let currentDateTime = new Date().toISOString();

    var requestLogItem = {
        requestLogID    : requestLogID,
        date            : currentDateTime,
        successful      : false,
        reason          : "-",
        start_latitude  : "-",
        end_latitude    : "-",
        start_longitude : "-",
        end_longitude   : "-"
    };

    dynamoDB.putItem({
        TableName : k_TABLE_NAME,
        Item      : requestLogItem
    }, function (result) {
        console.log("LOG: request log added - " + requestLogID + ", result: " + result);
    });
}

function updateLogEntry(requestLogID, start_latitude, end_latitude, start_longitude, end_longitude) {
    var doc = require('dynamodb-doc');
    var dynamoDB = new doc.DynamoDB();

    dynamoDB.updateItem({
        TableName           : k_TABLE_NAME,
        Key                 : { "requestLogID" : requestLogID },
        UpdateExpression    : "set start_latitude = :sla, end_latitude = :ela, start_longitude = :slo, end_longitude = :elo",
        ExpressionAttributeValues : {
            ':sla'    :   start_latitude,
            ':ela'    :   end_latitude,
            ':slo'    :   start_longitude,
            ':elo'    :   end_longitude
        },
        ReturnValues        : "UPDATED_NEW"
    }, function (result) {
        console.log("LOG: updated " + requestLogID);
    });
}

function endLogEntryWithSuccess(requestLogID) {
    var doc = require('dynamodb-doc');
    var dynamoDB = new doc.DynamoDB();

    dynamoDB.updateItem({
        TableName           : k_TABLE_NAME,
        Key                 : { "requestLogID" : requestLogID },
        UpdateExpression    : "set successful = :p",
        ExpressionAttributeValues : {
            ':p'    :   true
        },
        ReturnValues        : "UPDATED_NEW"
    }, function (result) {
        console.log("LOG: ended (success) " + requestLogID);
    });
}

function endLogEntryWithFailureReason(requestLogID, reason) {
    var doc = require('dynamodb-doc');
    var dynamoDB = new doc.DynamoDB();

    dynamoDB.updateItem({
        TableName           : k_TABLE_NAME,
        Key                 : { "requestLogID" : requestLogID },
        UpdateExpression    : "set reason = :p",
        ExpressionAttributeValues : {
            ':p'    :   reason
        },
        ReturnValues        : "UPDATED_NEW"
    }, function (result) {
        console.log("LOG: ended (failure), reason: " + reason);
    });
}

// Make these functions accessible (public) from `index.js`.
module.exports.createLogEntry = createLogEntry;
module.exports.updateLogEntry = updateLogEntry;
module.exports.endLogEntryWithSuccess = endLogEntryWithSuccess;
module.exports.endLogEntryWithFailureReason = endLogEntryWithFailureReason;
