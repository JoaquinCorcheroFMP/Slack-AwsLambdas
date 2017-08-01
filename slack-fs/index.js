'use strict';
const slack = require('slack');
const fs = require('fs');
const config = require('./config');
const destinationDirectory = '../store/';
const client = slack.rtm.client();

const generateFileName = () => {
    let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });

    return `${destinationDirectory}${guid}.json`
};

const writeFile = (fileContent) => {
    fs.writeFile(
        generateFileName(), 
        JSON.stringify(fileContent),
        (error) => {
            if(error)
                console.log(` ;-( Error writting file: ${error}`);
            else
                console.log(` :-) Event written: ${JSON.stringify(fileContent)}`);
        }
    );
};

const initializeEventListeners = () => {
    const eventNames = Object.keys(client);
    console.log('Adding listeners:');
    for(let i = 0; i < eventNames.length; i ++)
    {
        var eventName = eventNames[i];
        try{
            client[eventName]((msg) => {
                writeFile(msg);
            });
            console.log(` :-? Listening to event: ${eventName}`);
        }catch(e)
        {
            //console.log(`Failed to add event ${eventName}: ${e}`);
        }
    }

    console.log(' :-) Finished adding listeners');
};

const start = () => {
    client.listen({token:config.slackAccessToken});
    
    console.log(' :-? I am listening');

    initializeEventListeners();
};

start();