# Slack-AwsLambdas

####Steps to get the lambda function working:

- Followed tutorial from [slack](https://api.slack.com/tutorials/aws-lambda): the turorial is a bit out of date as the web interface has chaned. After following, and trying to access the api end point get internal server error.
- On the code the callback wasn't returning an expected result from an api, changed the code to: `callback(null, {"statusCode": 200, "body": JSON.stringify(result)})` found in [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html), very bottom
