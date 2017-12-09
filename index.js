exports.handler = (event, context, callback) => {
  // Setup
  var AWS = require("aws-sdk");
  var docClient = new AWS.DynamoDB.DocumentClient();

  // // User Inputs. - Use this to get working if validation breaks it.
  // var latitude = parseFloat(event.queryStringParameters.latitude);
  // var longitude = parseFloat(event.queryStringParameters.longitude);
  // var distance = parseInt(event.queryStringParameters.distance);

  let validationVar   = eventValidation(event);
  let distance    = validationVar[1];
  let latitude    = validationVar[2];
  let longitude   = validationVar[3];

  // Works out the radius of LAT/LON values to be accepted.
  var latChange = getRadiusLat(distance);
  var lonChange = getRadiusLon(distance);

  // Works out start positions of both longitude and latitude
  var start_lat = getStartPos(latitude, latChange);
  var end_lat = getEndPos(latitude, latChange);
  var start_lon = getStartPos(longitude, lonChange);
  var end_lon = getEndPos(longitude, lonChange);

  // Works out smallest/biggest point
  var explf = expFrom(start_lat, end_lat);
  var explt = expTo(start_lat, end_lat);
  var explof = expFrom(start_lon, end_lon);
  var explot = expTo(start_lon, end_lon);

  // Retrieves items from the DB.
  var params = {
    TableName:"price_paid_data",
    IndexName:"latitude-index",

    // What fields will be returned.
    ProjectionExpression: "latitude , longitude, price",

    // Filter the items to only include LAT/LON within the radius.
    FilterExpression: "latitude BETWEEN :latFrom AND :latTo and longitude BETWEEN :lonFrom AND :lonTo",

    ExpressionAttributeValues: {
      ":latFrom" :  explf, //Math.max / Math.min to account for negatice numbers and avoid an error with the between comparison.
      ":latTo"   :  explt,
      ":lonFrom" :  explof,
      ":lonTo"   :  explot
    }
  };

  //List of items that will be returned. Needed to account for DynamoDB window size.
  var items = [];

  var stop = false;

  docClient.scan(params, onScan);

// Accounts for DynamoDB only being able to send a set window at a time, scans whole DB.
function onScan(err,result) {
  if(err) {
    console.log(err);
    respond({"status" : "error", "message" : "Dynamo DB error: "+err});
  } else {
    items = items.concat(result.Items);

    if(typeof result.LastEvaluatedKey != "undefined") {
      params.ExclusiveStartKey = result.LastEvaluatedKey;
      docClient.scan(params, onScan);
    } else {
      stop = true;
      //callback(err,items);
      respond(items);
      //return;
    }
  }
}

function respond(items) {
    callback(null, {
        "statusCode" : 200,
        "headers" : { "Content-Type" : "application/json" },
        "body" : JSON.stringify(items)
        });
}

// This function simply reports an error back to the client.
function abortLocationUpdate(reason, callback) {
    callback(null, {
        "statusCode" : 200,
        "headers" : { "Content-Type" : "application/json" },
        "body" : JSON.stringify({
            "status" : "error",
            "message" : reason
        })
    });
}
}
// This is a function to perform input validation on the inputs in event.
function eventValidation(e) {
    let event = e;
    var latitude = parseFloat(event.queryStringParameters.latitude);
    var longitude = parseFloat(event.queryStringParameters.longitude);
    var distance = parseInt(event.queryStringParameters.distance);

    if (!(distance === null || latitude === null || longitude === null)) {

        // Extract the userId parameter and validate.
        if (!(Number.isInteger(distance))){
            abortLocationUpdate("Invalid distance", callback);
        }

        // Extract the `latitude` parameter and validate.
        if(!(longLatReg(latitude)) && !(checkLatRange(latitude))) {
            abortLocationUpdate("Invalid latitude parameter", callback);
        }

        // Extract the `longitude` parameter and validate.
        if(!(longLatReg(longitude)) && !(checkLongRange(longitude))) {
            abortLocationUpdate("Invalid longitude parameter", callback);
        }

        // If here, the validation was a success. *Martin Cheers*
        return [true, distance, latitude, longitude];

    } else {
        abortLocationUpdate("Null value at input", callback);
    }
}
// this is a function to check for a hexidecimal value and a length of 64 characters.
function hexReg(s) {
    var regExp = /[0-9A-Fa-f]{16}/g;
    return (regExp.test(s));
}

// this function checks the latitude and lonitude follow the correct format.
function longLatReg(regex) {
    // regex for latitude and longitude.
    var regExp = /(\-?\d+(\.\d+)?)/;
    return regExp.test(regex);
}

//Ensures the latitude is within the domain of -90 degrees to 90 degrees
function checkLatRange(latitude) {
  if (latitude <= 90 && latitude >= -90) {
    return true;
  }
  return false;
}

//Ensures the longitude is within the domain of -180 degrees to 180 degrees
function checkLongRange(longitude) {
  if (longitude <= 180 && longitude >= -180) {
    return true;
  }
  return false;
}

// This is a function to perform input validation on the inputs in event.
function eventValidation(event) {

  var latitude = parseFloat(event.queryStringParameters.latitude);
  var longitude = parseFloat(event.queryStringParameters.longitude);
  var distance = parseInt(event.queryStringParameters.distance);

  if (!validateLat(latitude)) {
    abortLocationUpdate("Invalid latitude parameter", callback);
  }

  if (!validateLon(longitude)) {
    abortLocationUpdate("Invalid longitude parameter", callback);
  }

  if (!validateDistance(distance)) {
    abortLocationUpdate("Invalid distance parameter", callback);
  }

  // If here, the validation was a success. *Martin Cheers*
  return [true, distance, latitude, longitude];
}

// Function to validate latitude
function validateLat(latitude) {
  if(latitude == null) {
    return false;
  }

  if(!longLatReg(latitude)) {
    return false;
  }

  if(!checkLatRange(latitude)) {
    return false;
  }
  return true;
}

// Function to validate longitude
function validateLon(longitude) {
  if(longitude == null) {
    return false;
  }

  if(!longLatReg(longitude)) {
    return false;
  }

  if(!checkLongRange(longitude)) {
    return false;
  }
  return true;
}

// Function to validate distance
function validateDistance(distance) {
  if(distance == null) {
    return false;
  }

  if (!(Number.isInteger(distance))){
    return false;
  }
  return true;
}

// This function simply reports an error back to the client.
function abortLocationUpdate(reason, callback) {
  callback(null, {
    "statusCode" : 200,
    "headers" : { "Content-Type" : "application/json" },
    "body" : JSON.stringify({
      "status" : "error",
      "message" : reason
    })
  });
}

// Works out the radius of LAT values to be accepted.
function getRadiusLat(distance) {
  var latChange = Math.abs(distance*(1/(110.574*1000)));
  return latChange;
}

// Works out the radius of LON values to be accepted.
function getRadiusLon(distance) {
  var lonChange = Math.abs(distance*(1/(111.320*1000)));
  return lonChange;
}

// Works out start position
function getStartPos(cord, change) {
  return cord - change;
}

// Works out end position
function getEndPos(cord, change) {
  return cord + change;
}

function expFrom(start, end) {
  return Math.min(start,end);
}

function expTo(start, end) {
  return Math.max(start,end);
}

// this is a function to check for a hexidecimal value and a length of 64 characters.
function hexReg(s) {
  var regExp = /[0-9A-Fa-f]{16}/g;
  return (regExp.test(s));
}

// this function checks the latitude and lonitude follow the correct format.
function longLatReg(regex) {
  // regex for latitude and longitude.
  var regExp = /(\-?\d+(\.\d+)?)/;
  return regExp.test(regex);
}

//Ensures the latitude is within the domain of -90 degrees to 90 degrees
function checkLatRange(latitude) {
  if (latitude <= 90 && latitude >= -90) {
    return true;
  }
  return false;
}

//Ensures the longitude is within the domain of -180 degrees to 180 degrees
function checkLongRange(longitude) {
  if (longitude <= 180 && longitude >= -180) {
    return true;
  }
  return false;
}

//EXPORTS FOR USE IN TESTING
module.exports.validateLat = validateLat;
module.exports.validateLon = validateLon;
module.exports.validateDistance = validateDistance;
module.exports.getRadiusLat = getRadiusLat;
module.exports.getRadiusLon = getRadiusLon;
module.exports.getStartPos = getStartPos;
module.exports.getEndPos = getEndPos;
module.exports.expFrom = expFrom;
module.exports.expTo = expTo;
module.exports.hexReg = hexReg;
module.exports.longLatReg = longLatReg;
module.exports.checkLatRange = checkLatRange;
module.exports.checkLongRange = checkLongRange;
module.exports.abortLocationUpdate = abortLocationUpdate;
module.exports.eventValidation = eventValidation
