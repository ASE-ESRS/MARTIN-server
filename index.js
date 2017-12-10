// MARTIN-server

// Get a reference to the logging functions.
const log = require('./log.js');

// The ID used to uniquely identify to the log of this request (used by `log.js`).
var requestLogID;

// Access to DynamoDB.
var AWS;
var dynamoDB;

// The callback function is accessed by the `abortLocationUpdate` and `returnResults` methods.
var handler;

exports.handler = (event, context, callback) => {
    // Begin the log entry for this request.

    // The `uuid` library is used to generate unique strings.
    const uuid = require('uuid/v4');
    requestLogID = uuid();
    log.createLogEntry(requestLogID);

    AWS = require("aws-sdk");
    dynamoDB = new AWS.DynamoDB.DocumentClient();

    handler = callback;

    // Validate the input parameters
    let validatedParameters = extractParametersFromEvent(event);

    // Ensure the parameters were valid, otherwise abort.
    if (typeof validatedParameters == "undefined") { return }

    let start_latitude = validatedParameters.start_latitude;
    let end_latitude = validatedParameters.end_latitude;
    let start_longitude = validatedParameters.start_longitude;
    let end_longitude = validatedParameters.end_longitude;

    log.updateLogEntry(requestLogID, start_latitude, end_latitude, start_longitude, end_longitude);

    // Set up the parameters to use to scan the database.
    scanParameters = {
        TableName : "price_paid_data",

        // Specify the fields that will be returned.
        ProjectionExpression : "latitude, longitude, price",

        // Filter the items to only include datapoints within the appropriate radius.
        FilterExpression : "latitude BETWEEN :latFrom AND :latTo and longitude BETWEEN :lonFrom AND :lonTo",

        ExpressionAttributeValues : {
            ":latFrom" :  start_latitude,
            ":latTo"   :  end_latitude,
            ":lonFrom" :  start_longitude,
            ":lonTo"   :  end_longitude
        }
    };

    dynamoDB.scan(scanParameters, scanCompletionHandler);
};

var scanParameters;

// Stores the intermediate list of items to send back to the client.
var items = [];

// This handler is required because DynamoDB is only able to send back a set window at a given time.
function scanCompletionHandler(error, result) {
    if (error) {
        console.log(error);
        abortLocationUpdate("Dynamo DB error: " + error);
    } else {
        items = items.concat(result.Items);

        if (typeof result.LastEvaluatedKey != "undefined") {
            scanParameters.ExclusiveStartKey = result.LastEvaluatedKey;
            dynamoDB.scan(scanParameters, scanCompletionHandler);
        } else {
            returnResults(items);
        }
    }
}

// Returns the request's response items in JSON format.
function returnResults(items) {
    handler(null, {
        "statusCode" : 200,
        "headers" : { "Content-Type" : "application/json" },
        "body" : JSON.stringify(items)
    });

    log.endLogEntryWithSuccess(requestLogID);
}

// Extracts parameters from the event and invokes methods to validate them.
function extractParametersFromEvent(event) {
    var start_latitude = parseFloat(event.queryStringParameters.start_latitude);
    var end_latitude = parseFloat(event.queryStringParameters.end_latitude);
    var start_longitude = parseFloat(event.queryStringParameters.start_longitude);
    var end_longitude = parseFloat(event.queryStringParameters.end_longitude);

    if (validParameters(start_latitude, end_latitude, start_longitude, end_longitude)) {
        return {
            "start_latitude" : start_latitude,
            "end_latitude" : end_latitude,
            "start_longitude" : start_longitude,
            "end_longitude" : end_longitude
        };
    }
}

// Ensures all four input parameters are valid.
function validParameters(start_latitude, end_latitude, start_longitude, end_longitude) {
    // Validate the `start_latitude` parameter.
    if (validLatitude(start_latitude) == false) {
        log.endLogEntryWithFailureReason(requestLogID, "Invalid start_latitude parameter");
        abortLocationUpdate("Invalid start_latitude parameter");
        return false;
    }

    // Validate the `end_latitude` parameter.
    if (validLatitude(end_latitude) == false) {
        log.endLogEntryWithFailureReason(requestLogID, "Invalid end_latitude parameter");
        abortLocationUpdate("Invalid end_latitude parameter");
        return false;
    }

    // Validate the `start_longitude` parameter.
    if (validLongitude(start_longitude) == false) {
        log.endLogEntryWithFailureReason(requestLogID, "Invalid start_longitude parameter");
        abortLocationUpdate("Invalid start_longitude parameter");
        return false;
    }

    // Validate the `end_longitude` parameter.
    if (validLongitude(end_longitude) == false) {
        log.endLogEntryWithFailureReason(requestLogID, "Invalid end_longitude parameter");
        abortLocationUpdate("Invalid end_longitude parameter");
        return false;
    }

    // If here, the validation was a success 🎉.
    return true;
}

// Ensures the supplied coordinate (latitude or longitude) is of the correct form (using a regex).
function wellFormedLatLong(latLong) {
    // Regex for a latitude/longitude coordinate.
    var regex = /(\-?\d+(\.\d+)?)/;
    return regex.test(latLong);
}

// Validates the latitude.
function validLatitude(latitude) {
    if (latitude == null) {
        return false;
    }

    if (wellFormedLatLong(latitude) == false) {
        return false;
    }

    if (validLatitudeRange(latitude) == false) {
        return false;
    }

    return true;
}

// Validates the longitude.
function validLongitude(longitude) {
    if (longitude == null) {
        return false;
    }

    if (wellFormedLatLong(longitude) == false) {
        return false;
    }

    if (validLongitudeRange(longitude) == false) {
        return false;
    }

    return true;
}

// Ensures the latitude is within the domain of -90 degrees to 90 degrees.
function validLatitudeRange(latitude) {
    return (latitude <= 90 && latitude >= -90);
}

// Ensures the longitude is within the domain of -180 degrees to 180 degrees.
function validLongitudeRange(longitude) {
    return (longitude <= 180 && longitude >= -180);
}

// This function simply reports an error back to the client.
function abortLocationUpdate(reason) {
    handler(null, {
        "statusCode" : 200,
        "headers" : { "Content-Type" : "application/json" },
        "body" : JSON.stringify({
            "status" : "error",
            "message" : reason
        })
    });
}

// Module exports for each function to enable Mocha to test them.
module.exports.validParameters = validParameters
module.exports.wellFormedLatLong = wellFormedLatLong
module.exports.validLatitude = validLatitude
module.exports.validLongitude = validLongitude
module.exports.validLatitudeRange = validLatitudeRange
module.exports.validLongitudeRange = validLongitudeRange
