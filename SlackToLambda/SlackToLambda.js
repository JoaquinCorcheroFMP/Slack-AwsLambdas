'use strict';
const https = require('https');
const AWS = require('aws-sdk');
const qs = require('querystring');
const VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;
const ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN;
const BUCKET_NAME = 'slackl-lambda-s3';


let doCallback = (statusCode, body, callback) => {
    callback(null, {"statusCode": statusCode, "body": body});
};

let validateVerificationToken = (body, callback) => {
    if (body.token === VERIFICATION_TOKEN){
        doCallback(200, body.challenge, callback);
        return;
    }
    doCallback(402, "verification failed", callback);   
};

let putObjectToS3 = (data, callback) =>{
    var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    
    var s3 = new AWS.S3();
        var params = {
            Bucket : BUCKET_NAME,
            Key : guid + ".json",
            Body : JSON.stringify(data)
        }
        s3.putObject(params, function(err, data) {
            if (err){
                doCallback(500, "Couldn't save message on S3: " + err.stack, callback);
                console.log(err, err.stack);
            }else{
                doCallback(200, "Message saved to S3", callback);
                console.log(data);           // successful response
            }
        });
}

// Lambda handler
exports.handler = (data, context, callback) => {
    var body = JSON.parse(data.body);
    try
    {
        switch(body.type)
        {
            case "url_verification": 
                validateVerificationToken(body, callback);
            break;
            case "event_callback": 
                putObjectToS3(body, callback);
            break;
            default: 
                doCallback(404, "Invalid type received: " + body.type, callback);
        }
    }catch(e)
    {
        doCallback(500, e, callback);
    }
  };