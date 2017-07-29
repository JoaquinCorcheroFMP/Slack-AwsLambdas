'use strict';

const MongoClient = require('mongodb').MongoClient;
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PWD = process.env.MONGO_PWD;

console.log('Loading function');

let sendToDB = (fileContent) => {
    var uri = `mongodb://${MONGO_USER}:${MONGO_PWD}@slacklambdamongodb-shard-00-00-t40au.mongodb.net:27017,slacklambdamongodb-shard-00-01-t40au.mongodb.net:27017,slacklambdamongodb-shard-00-02-t40au.mongodb.net:27017/<DATABASE>?ssl=true&replicaSet=SlackLambdaMongoDb-shard-0&authSource=admin`;
    var jsonContent = JSON.parse(fileContent);
    MongoClient.connect(uri, function(err, db) {
        db.SlackMessages.insertOne(jsonContent);
        db.close();
    });
};

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            console.log('CONTENT TYPE:', data.ContentType);
            sendToDB(data.Body);
            console.log('Sent To DB');
            callback(null, data.ContentType);
        }
    });
};
