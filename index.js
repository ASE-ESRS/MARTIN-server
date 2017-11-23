exports.handler         = (event, context, callback) => {
    // Setup
    var AWS             = require("aws-sdk");
    var docClient       = new AWS.DynamoDB.DocumentClient();
 
    //Carry out input validation 
    let validationVar   = eventValidation(event);

    // User Inputs returned from validation. 
    if(validationVar[0]){
        let distance    = validationVar[1];
        let latitude    = validationVar[2];
        let longitude   = validationVar[3];
    } else {
        abortLocationUpdate("Error with input validation", callback);
    }    

    // Works out the radius of LAT/LON values to be accepted. 
    var start_lat       = (latitude - (1/(distance/(110.574*1000))));
    var end_lat         = (latitude + (1/(distance/(110.574*1000))));
    var start_lon       = (longitude - (1/(distance/(111.320*Math.cos(start_lat)))));
    var end_lon         = (longitude + (1/(distance/(111.320*Math.cos(end_lat)))));
    
    // Retrieves items from the DB. 
    var params = getParams(start_lat, end_lat, start_lon, end_lon);
 
    //List of items that will be returned. Needed to account for DynamoDB window size. 
    var items = [];
    
    // Accounts for DynamoDB only being able to send a set window at a time, scans whole DB. 
    var scanExecute = function(callback) {
     
        docClient.scan(params,function(err,result) {
 
            if(err) {
                callback(err);
            } else {
                 
                items = items.concat(result.Items);
 
                if(result.LastEvaluatedKey) {
 
                    params.ExclusiveStartKey = result.LastEvaluatedKey;
                    scanExecute(callback);              
                } else {
                    
                    // This is where the final items are returned. 
                    callback(err,items);      // **** Uncomment this and comment all below if you just want all prices returned. 
                    

                    // // Add in the averaging functionality here. 
                    // var latitudeRange = Math.range(items.latitude);
                    // console.print("LAT RANGE:   " + latitudeRange);
                    
                    // var sum = 0;
                    // for(var i = 0, l = items.length; i < l; i++){
                    //      sum += parseInt( items[i].price, 10 ); //don't forget to add the base
                    // }
                    // var avg = sum/items.length;
                    
                    // callback(err,avg);
                }   
            }
        });
    }
    
    scanExecute(callback);
};

// This is a function to perform input validation on the inputs in event.
function eventValidation(e){
  
    let event = e;
    let userDistance = event.queryStringParameters.distance;
    let latitudeInput = event.queryStringParameters.latitude;
    let longitudeInput = event.queryStringParameters.longitude;

    if (!(userDistance === null || latitudeInput === null || longitudeInput === null)) {
        // Extract the userId parameter and validate.  
        if (Number.isInteger(Distance)){
            abortLocationUpdate("Distance not a Number", callback);
        }
        
        // Extract the `latitude` parameter and validate.       
        if(!(longLatRegExValid(latitudeInput))) {
            abortLocationUpdate("Invalid latitude parameter", callback);
        }
        
        // Extract the `longitude` parameter and validate.
        if(!(longLatRegExValid(longitudeInput))) {
            abortLocationUpdate("Invalid longitude parameter", callback);
        }

        // If here the validation was a success *Martin Cheers*
        return [true, userDistance, latitudeInput, longitudeInput]

    } else {
        abortLocationUpdate("Null value at input", callback);
    }
}

function getParams(start_lat, end_lat, start_lon, end_lon){
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
             ":latFrom" :   Math.min(start_lat,end_lat), //Math.max / Math.min to account for negatice numbers and avoid an error with the between comparison. 
             ":latTo"   :   Math.max(start_lat,end_lat), 
             ":lonFrom" :   Math.min(start_lon, end_lon),
             ":lonTo"   :   Math.max(start_lon, end_lon)
        }
    };
    return params
}

module.exports = {
  // Ensures that the userId input is valid according to the regular expression.
  userIdRegExValid: function (userIdParameter) {
    //var regEx = /[0-9A-Fa-f]{16}/g;
    var regEx = /^[a-fA-F0-9]{16}$/;
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
