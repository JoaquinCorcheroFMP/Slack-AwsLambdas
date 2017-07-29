'use strict'
const MongoClient = require('mongodb').MongoClient;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PWD = process.env.MONGO_PWD;
let cachedDb = null;

let getDocumentAdded = (event) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    let fileContent = null;

    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            console.log('Got the document:', data.ContentType);
            fileContent = data.Body;
        }
    });

    return fileContent;
};

let processDocument = (fileContent, context, callback) => {
    let atlas_connection_uri = `mongodb://${MONGO_USER}:${MONGO_PWD}@slacklambdas3lambdamongo-shard-00-00-t40au.mongodb.net:27017,slacklambdas3lambdamongo-shard-00-01-t40au.mongodb.net:27017,slacklambdas3lambdamongo-shard-00-02-t40au.mongodb.net:27017/admin?ssl=true&replicaSet=SlackLambdaS3LambdaMongo-shard-0&authSource=admin`;
    let jsonContents = JSON.parse(JSON.stringify(fileContent));

    //the following line is critical for performance reasons to allow re-use of database connections across calls to this Lambda function and avoid closing the database connection. The first call to this lambda function takes about 5 seconds to complete, while subsequent, close calls will only take a few hundred milliseconds.
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        if (cachedDb == null) {
            console.log('=> connecting to database');
            MongoClient.connect(atlas_connection_uri, function (err, db) {
                cachedDb = db;
                return createDoc(db, jsonContents, callback);
            });
        }
        else {
            createDoc(cachedDb, jsonContents, callback);
        }
    }
    catch (err) {
        console.error('an error occurred', err);
    }
}

let createDoc = (db, json, callback) => {
    const collection = 'slack';
  db.collection('collection').insertOne( json, function(err, result) {
      if(err!=null) {
          console.error("an error occurred in createDoc", err);
          callback(null, JSON.stringify(err));
      }
      else {
        console.log(`Record Id ${result.insertedId} added to the collection`);
        callback(null, "SUCCESS");
      }
      //we don't need to close the connection thanks to context.callbackWaitsForEmptyEventLoop = false (above)
      //this will let our function re-use the connection on the next called (if it can re-use the same Lambda container)
      //db.close();
  });
};

exports.handler = (event, context, callback) => {
    let fileContent = getDocumentAdded(event);

    if(!fileContent)
        return;

    processDocument(fileContent, context, callback);
};