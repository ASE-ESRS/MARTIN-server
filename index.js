// The LambdaLocationUpdateHandler is responsible for responding to requests from clients to
// update their current location entry in the database.
//
// The DynamoDB locations table can be viewed here:
// https://eu-west-2.console.aws.amazon.com/dynamodb/home?region=eu-west-2#tables:selected=locations
//
// This code must be copied over to the AWS Lambda Management Console here:
// https://eu-west-2.console.aws.amazon.com/lambda/home?region=eu-west-2#/functions/HandleLocationUpdate

//comment below out if testing with mocha--------------------------------------------
//var doc = require('dynamodb-doc');
//var dynamodb = new doc.DynamoDB();

// Name of the locations table in DynamoDB.
let k_TABLE_NAME = "locations";

// This function is called in response to a request from a client.
//
// The `event` parameter holds information about the request, including the parameters.
// The following parameters are expected in the request:
//  - `userId` a unique identifier (e.g. email address) for this device (used as DB primary key).
//  - `latitude` the current latitude of the user (expected in ISO 6709 format - https://en.wikipedia.org/wiki/ISO_6709).
//  - `longitude` the current longitude of the user (expected in ISO 6709 format.)

// To print a log in the console use -> console.log('value1 =', event.key1);

exports.handler = (event, context, callback) => {
    let validatedInput = validateInput(event);

    // Input validation has failed (and been reported via the callback), so just abort.
    if (validatedInput == false) { return }

    // Make a note of the current time.
    let currentDateTime = new Date().toISOString();

    // Create the new location entry item.
    var locationItem = {
        userId      : validatedInput.userId,
        date        : currentDateTime,
        latitude    : validatedInput.latitude,
        longitude   : validatedInput.longitude
    };

    saveLocationItem(locationItem);
};

// Saves the supplied location update in the DynamoDB table.
function saveLocationItem(locationItem) {
    dynamodb.putItem({
        "TableName" : k_TABLE_NAME,
        "Item" : locationItem
    }, function(error, data) {
        if (error) {
            abortLocationUpdate("Failed inserting location update into DynamoDB: " + error, callback);
        } else {
            callback(null, {
                "statusCode" : 200,
                "headers" : { "Content-Type" : "application/json" },
                "body" : JSON.stringify({
                    "status" : "success",
                    "message" : "Successfully updated location"
                })
            });
        }
    });
}

/*
██ ███    ██ ██████  ██    ██ ████████     ██    ██  █████  ██      ██ ██████   █████  ████████ ██  ██████  ███    ██
██ ████   ██ ██   ██ ██    ██    ██        ██    ██ ██   ██ ██      ██ ██   ██ ██   ██    ██    ██ ██    ██ ████   ██
██ ██ ██  ██ ██████  ██    ██    ██        ██    ██ ███████ ██      ██ ██   ██ ███████    ██    ██ ██    ██ ██ ██  ██
██ ██  ██ ██ ██      ██    ██    ██         ██  ██  ██   ██ ██      ██ ██   ██ ██   ██    ██    ██ ██    ██ ██  ██ ██
██ ██   ████ ██       ██████     ██          ████   ██   ██ ███████ ██ ██████  ██   ██    ██    ██  ██████  ██   ████
*/

// This is a function to perform input validation on the inputs from event.
function validateInput(event) {
    let userIdInput = event.queryStringParameters.userId;
    let latitudeInput = event.queryStringParameters.latitude;
    let longitudeInput = event.queryStringParameters.longitude;

    if (userIdValid(userIdInput) == false) { return false }
    if (latitudeIsValid(latitudeInput) == false) {
        abortLocationUpdate("Invalid latitude parameter supplied.", callback);
        return false;
    }
    if (longitudeIsValid(longitudeInput) == false) {
        abortLocationUpdate("Invalid longitude parameter supplied.", callback);
        return false;
    }

    let validInput = {
        userId      : userIdInput,
        latitude    : latitudeInput,
        longitude   : longitudeInput
    };

    return validInput;
}

// Ensures a hexidecimal parameter with a length of 16 characters is supplied.
function userIdValid(userIdParameter) {
    // Guard against empty parameters.
    if (userIdParameter === null) {
        abortLocationUpdate("No userId parameter supplied.", callback);
        return false;
    }

    // Make sure it's valid according to the following regular expression.
    if (userIdRegExValid(userIdParameter) == false) {
        return false;
    }

    // Otherwise, the UserId is valid.
    return true;
}

function latitudeLongitudeIsValid(latLongParameter, longLatEnumType) {
    // Guard against empty parameters.
    if (latLongParameter === null) {
        return false;
    }

    if (longLatRegExValid(latLongParameter) == false) {
        return false;
    }

    return true;
}

// This function reports an error back to the client.
function reportLocationUpdateError(reason, callback) {
    callback(null, {
        "statusCode" : 200,
        "headers" : { "Content-Type" : "application/json" },
        "body" : JSON.stringify({
            "status" : "error",
            "message" : reason
        })
    });
}

module.exports = {
  // Ensures that the userId input is valid according to the regular expression.
  userIdRegExValid: function (userIdParameter) {
    var regEx = /[0-9A-Fa-f]{16}/g;
    return regEx.test(userIdParameter);
  },
  //Ensures that the longitude/latitude input is valid according to the regular expression.
  longLatRegExValid: function(abcd) {
    var regEx = /(\-?\d+(\.\d+)?)/;
    return regEx.test(abcd);
  },
  //Ensures the latitude is within the domain of -90 degrees to 90 degrees
  latitudeIsValidSize: function(latitude) {
    if (latitude <= 90 && latitude >= -90) {
      return true;
    }
    return false;
  },
  //Ensures the longitude is within the domain of -180 degrees to 180 degrees
  longitudeIsValidSize: function(longitude) {
    if (longitude <= 180 && longitude >= -180) {
      return true;
    }
    return false;
  }
};
