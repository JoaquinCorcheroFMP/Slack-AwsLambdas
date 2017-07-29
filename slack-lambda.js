// Lambda handler
exports.handler = (data, context, callback) => {
    console.log(data);
    if(!data.body)
    {
        data = {
            body: {
                "type": "url_verification",
    	        "token": "0XM4M4LJ5ZUfxX6PghXqSVaq",
    	        "challenge": "YwcpXAfHE0d1OXcTMQNa9Ox7YFxkYgWFU4idhaxHARep8vUJLg1F"
            }
        };
    }
    
    callback(null, {"statusCode": 200, "body": data.body});
};