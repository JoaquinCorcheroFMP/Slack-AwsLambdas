'user strict';
const MongoClient = require('mongodb').MongoClient;
const chokidar = require('chokidar');
const fs = require('fs');
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PWD = process.env.MONGO_PWD;
const MONGO_INSTANCES = process.env.MONGO_INSTANCES;
const WATCHED_DIRECTORY = '../store';
const COLLECTION = 'slack';
let cachedDb = null;

const processDocument = (fileContent) => {
    let atlas_connection_uri = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_INSTANCES}/admin?ssl=true&replicaSet=SlackLambdaS3LambdaMongo-shard-0&authSource=admin`;
    let jsonContents = JSON.parse(fileContent);
    if (cachedDb === null) {
        MongoClient.connect(atlas_connection_uri, function (err, db) {
            cachedDb = db;
            createDoc(db, jsonContents);
        });
    }
    else {
        createDoc(cachedDb, jsonContents);
    }
};

const createDoc = (db, myobj) => {
   db.collection(COLLECTION).insertOne(myobj, function(err, res) {
        if (err) throw err;
        db.close();
    });
};

let watcher = chokidar.watch(WATCHED_DIRECTORY, {
    persistent: true,
    ignoreInitial: false,
    alwaysState: true
});

watcher.on('add', fileName => {
    fs.readFile(fileName, "utf8", function(err, data) {
        if (err) throw err;
        processDocument(data);
        console.log(`File ${fileName} processed!`);

        fs.unlink(fileName,function(err){
            if(err) return console.log(`File ${fileName} couldn't be deleted: ${err}!`);
        });
    }); 
});
