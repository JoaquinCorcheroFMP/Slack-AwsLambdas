const slack = require('slack');
const fs = require('fs');
const token = process.env.SLACK_ACCESS_TOKEN;
const destinationDirectory = '../store/';
const client = slack.rtm.client();

const generateFileName = () => {
    let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });

    return `${destinationDirectory}${guid}.json`
};

const writeFile = (fileContent) => {
    fs.writeFile(
        generateFileName(), 
        JSON.stringify(fileContent),
        function(er) {
            if(er)
                console.log('Error writting file: ' + er);
        }
    );
};

const initializeEventListeners = (eventNames) => {
    client.message(function(msg) {
        writeFile(msg);
    });
};

const start = () => {
    client.listen({token:token});
    
    console.log('I am listening');

    initializeEventListeners();
};

start();