const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "TranmereWebPlayerSeasonSummaryTable";

exports.handler = async function (event, context) {

    var squadSearch = await dynamo.scan({TableName:"TranmereWebPlayerTable"}).promise();
    var playerHash = {};
    for(var i=0; i < squadSearch.Items.length; i++) {
        playerHash[squadSearch.Items[i].name] = squadSearch.Items[i];
    }

    var season = event.queryStringParameters ? event.queryStringParameters.season : null;
    var sort = event.queryStringParameters ? event.queryStringParameters.sort : null;
    var player = event.queryStringParameters ? event.queryStringParameters.player : null;
    var filter = event.queryStringParameters ? event.queryStringParameters.filter : null;

    var query = {};

    if(player) {
        query = {
            TableName:TABLE_NAME,
            IndexName: "ByPlayerIndex",
            KeyConditionExpression :  "Player = :player",
            ExpressionAttributeValues: {
                ":player" : player
            }
        };
    } else {
        if(!season)
            season = "TOTAL";

        query = {
            TableName:TABLE_NAME,
            KeyConditionExpression :  "Season = :season",
            ExpressionAttributeValues: {
                ":season" : season
            }
        };
    }

    var result = await dynamo.query(query).promise();
    var results = result.Items;

    for(var x=0; x < results.length; x++ ) {
        delete results[x].TimeToLive;
        results[x].bio = playerHash[results[x].Player];
        if(results[x].bio && results[x].bio.picLink) {
            results[x].bio.pic = {
               fields:{
                   file:{
                       url: results[x].bio.picLink
                   }
               }
           }
        }
    }


    if(filter) {
        var newResults = [];
        for(var i=0; i < results.length; i++) {
            if(filter == "OnlyOneApp" && results[i].Apps == 1) {
                newResults.push(results[i]);
            } 
            if(filter == "GK" && results[i].bio && results[i].bio.position  == "Goalkeeper") {
                newResults.push(results[i]);
            }        
            if(filter == "STR" && results[i].bio && results[i].bio.position  == "Striker") {
                newResults.push(results[i]);
            }
            if(filter == "CM" && results[i].bio && results[i].bio.position  == "Central Midfielder") {
                newResults.push(results[i]);
            }   
            if(filter == "WIN" && results[i].bio && results[i].bio.position  == "Winger") {
                newResults.push(results[i]);
            }   
            if(filter == "FB" && results[i].bio && results[i].bio.position  == "Full Back") {
                newResults.push(results[i]);
            }   
            if(filter == "CD" && results[i].bio && results[i].bio.position  == "Central Defender") {
                newResults.push(results[i]);
            }                       
        }
        results = newResults;
    }

    if(sort == "Goals") {
        results.sort(function(a, b) {
          if (a.goals < b.goals) return 1
          if (a.goals > b.goals) return -1
          return 0
        });
    } else {
        results.sort(function(a, b) {
          if (a.Apps < b.Apps) return 1
          if (a.Apps > b.Apps) return -1
          return 0
        });
    }

    return {
     "isBase64Encoded": false,
     "headers": { 
      'Content-Type': 'application/json', 
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400'
    },
     "statusCode": 200,
     "body": JSON.stringify({players: results.slice(0, 50)})
     };
};