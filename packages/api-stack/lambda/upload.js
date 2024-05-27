const { v4: uuidv4 } = require('uuid');
const csv=require('csvtojson');
import AWS from 'aws-sdk';
const utils = require('@tranmere-web/lib/src/utils')();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = () => {
   const tableName = utils.TRANSFER_TABLE;

    csv().fromFile("./csv/transfers.csv")
        .on('data', (row) => {
        let item = JSON.parse(row);
        item.season = parseInt(item.season);
        item.cost = parseInt(item.cost);
        item.id = uuidv4();
        let paramsToPush = {
            TableName:tableName,
            Item: item
        };
        addData(paramsToPush);
    });
};

function addData(params) {
    console.log("Adding a new item based on: ");
    docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(params.Item, null, 2));
        }
    });
}