exports.handler = (event, context, callback) => {
    // Setup
    var AWS = require("aws-sdk");
    var docClient = new AWS.DynamoDB.DocumentClient();

    // User Inputs. - Use this to get working if validation breaks it.
    var latitude = parseFloat(event.queryStringParameters.latitude);
    var longitude = parseFloat(event.queryStringParameters.longitude);
    var distance = parseInt(event.queryStringParameters.distance);

    // Works out the radius of LAT/LON values to be accepted.
    var latChange = Math.abs(distance*(1/(110.574*1000)));
    var lonChange = Math.abs(distance*(1/(111.320*1000))); //Math.cos(Math.abs(latitude)))));

    var start_lat = latitude - latChange;
    var end_lat = latitude + latChange;
    var start_lon = longitude - lonChange;
    var end_lon = longitude + lonChange;

    var explf =    Math.min(start_lat,end_lat);
    var explt =    Math.max(start_lat,end_lat);
    var explof =   Math.min(start_lon, end_lon);
    var explot =   Math.max(start_lon, end_lon);

    // Retrieves items from the DB.
    var params = {
        TableName:"price_paid_data",

        // What fields will be returned.
        ProjectionExpression: "latitude , longitude, price",

        // Filter the items to only include LAT/LON within the radius.
        FilterExpression: "#latitude BETWEEN :latFrom AND :latTo and #longitude BETWEEN :lonFrom AND :lonTo",
        ExpressionAttributeNames: {
            "#latitude": "latitude",
            "#longitude": "longitude"
        },
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
            console.log(JSON.stringify(result));

            if(typeof result.LastEvaluatedKey != "undefined") {
                params.ExclusiveStartKey = result.LastEvaluatedKey;
                docClient.scan(params, onScan);
            } else {
                console.log("Items: " + items);
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
};

module.exports = {

  // Ensures that the userId input is valid according to the regular expression.
  //   userIdRegExValid: function (userIdParameter) {
  //    //var regEx = /[0-9A-Fa-f]{16}/g;
  //    var regEx = /^[a-fA-F0-9]{16}$/;
  //    return regEx.test(userIdParameter);
  //  },

   //Ensures that the longitude/latitude input is valid according to the regular expression.
   longLatRegExValid: function(regexInput) {
     var regEx = /(\-?\d+(\.\d+)?)/;
     return regEx.test(regexInput);
   },

   //Ensures the latitude is within the domain of -90 degrees to 90 degrees
   latitudeIsValidSize: function(latitude) {
     if (latitude <= 90 && latitude >= -90) {
       return true;
     }
   },

   //Ensures the longitude is within the domain of -180 degrees to 180 degrees
   longitudeIsValidSize: function(longitude) {
     if (longitude <= 180 && longitude >= -180) {
       return true;
     }
   }
 };
