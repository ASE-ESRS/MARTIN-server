// Get a reference to DynamoDB
var AWS = require("aws-sdk");
dynamoDB = new AWS.DynamoDB.DocumentClient();

// Name of the request_logs table in DynamoDB.
let k_TABLE_NAME = "request_logs";

function createLogEntry(requestLogID) {
    var requestLogItem = {
        requestLogID    : requestLogID,
        successful      : false,
        reason          : null,
        start_latitude  : null,
        end_latitude    : null,
        start_longitude : null,
        end_longitude   : null
    };

    dynamodb.putItem({
        TableName : k_TABLE_NAME,
        Item      : requestLogItem
    }, function (result) {
        console.log("LOG: request log added - " + requestLogID + ", result: " + result);
    });
}

function updateLogEntry(requestLogID, start_latitude, end_latitude, start_longitude, end_longitude) {
    console.log("LOG: updated " + requestLogID);
    console.log("LOG: S_LAT E_LAT S_LON E_LON " + start_latitude + ", " + end_latitude + ", " + start_longitude + ", " + end_longitude);
}

function endLogEntryWithSuccess(requestLogID) {
    console.log("LOG: ended (success) " + requestLogID);
}

function endLogEntryWithFailureReason(requestLogID, reason) {
    console.log("LOG: ended (failure) " + requestLogID);
    console.log("LOG: reason " + reason);
}

// Make these functions accessible (public) from `index.js`.
module.exports.createLogEntry = createLogEntry;
module.exports.updateLogEntry = updateLogEntry;
module.exports.endLogEntryWithSuccess = endLogEntryWithSuccess;
module.exports.endLogEntryWithFailureReason = endLogEntryWithFailureReason;
