'user strict';
const MongoClient = require('mongodb').MongoClient;
const chokidar = require('chokidar');
const fs = require('fs');
const config = require('./config');
const WATCHED_DIRECTORY = '../store';
const COLLECTION = 'slack';
let cachedDb = null;

const processDocument = (jsonContent) => {
    const atlas_connection_uri = config.mongoCnn;
    if (cachedDb === null) {
        MongoClient.connect(atlas_connection_uri, (err, db) => {
            cachedDb = db;
            createDoc(db, jsonContent);
        });
    }
    else {
        createDoc(cachedDb, jsonContent);
    }
};

const createDoc = (db, myobj) => {
   db.collection(COLLECTION).insertOne(myobj, (err, res) => {
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
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) throw err;
        try
        {
            processDocument(JSON.parse(data));
            console.log(`File ${fileName} imported!`);

            fs.unlink(fileName, (err) => {
                if(err) return console.log(`File ${fileName} couldn't be deleted: ${err}!`);
            });
        }catch(e)
        {
            console.log(`${fileName} failed due to ${e}: ${data}`);
        }
    }); 
});
