const https = require('https');
const qs = require('querystring');
const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;


doCallback = (statusCode, body, callback) => {
    callback(null, {"statusCode": statusCode, "body": body});
};

validateVerificationToken = (body, callback) => {
    if (body.token === VERIFICATION_TOKEN){
        doCallback(200, body.challenge, callback);
        return;
    }
    doCallback(402, "verification failed", callback);   
};

processEvent = (event, callback) =>{

        var text = `<@${event.user}> Send from process`;
        var message = { 
            token: ACCESS_TOKEN,
            channel: event.channel,
            text: text
        };

        var query = qs.stringify(message); // prepare the querystring
        https.get(`https://slack.com/api/chat.postMessage?${query}`);

    //doCallback(200, event + "55", callback);
    doCallback(200, null, callback);
};

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
                processEvent(body.event, callback);
            break;
            default: 
                doCallback(404, "Invalid type received: " + body.type, callback);
        }
    }catch(e)
    {
        doCallback(500, e, callback);
    }
    //doCallback(200, body.token, callback);
};