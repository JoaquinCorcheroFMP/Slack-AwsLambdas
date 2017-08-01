#Slack AwsLambdas

Sorry to disapoint, but no lambdas here...

Instead is a two part app that will pull events from slack and save them on a directory called store.

The second app with watch the directory and insert the records on a Mongo database.


##To make the solution work:

###slack-fs
1 Populate with your own value the config.js.example and rename the file to config.js
2 npm run start

###dir-mongo
1 Populate with your own value the config.js.example and rename the file to config.js
2 npm run start
