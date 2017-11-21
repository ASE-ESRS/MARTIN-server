exports.handler = (event, context, callback) => {
    // Setup
    var AWS = require("aws-sdk");
    var docClient = new AWS.DynamoDB.DocumentClient();
 
    // User Inputs. 
    var latitude = event.latitude;
    var longitude = event.longitude;
    var distance = event.distance;
    
    // Works out the radius of LAT/LON values to be accepted. 
    var start_lat = (latitude - (1/(distance/(110.574*1000))));
    var end_lat = (latitude + (1/(distance/(110.574*1000))));
    var start_lon = (longitude - (1/(distance/(111.320*Math.cos(start_lat)))));
    var end_lon = (longitude + (1/(distance/(111.320*Math.cos(end_lat)))));
    
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
 
    //List of items that will be returned. Needed to account for DynamoDB window size. 
    var items = []
    
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