var https = require('https');

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    var snsData = JSON.parse(event.Records[0].Sns.Message);
    console.log('From SNS:', snsData);
    
    var message = snsData.message;

    var post_data = JSON.stringify(
        {
            "message": message, 
            "name": "SYSTEM ALERT", 
            "channel": "default"
            
        });

    // Object of options to designate where to send our request
    var post_options = {
        host: 'INSERT YOUR API GATEWAY URL HERE',
        port: '443',
        path: '/ZombieWorkshopStage/zombie/message',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };
    
    var req = https.request(post_options, function(res) {
        var body = '';
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            console.log('Successfully processed HTTPS response');
            // If we know it's JSON, parse it
            if (res.headers['content-type'] === 'application/json') {
                body = JSON.parse(body);
            }
            context.succeed(body);
        });
        
    });
    req.on('error', context.fail);
    req.write(post_data);
    req.end();
};

