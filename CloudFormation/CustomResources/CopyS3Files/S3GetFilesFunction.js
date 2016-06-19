var aws = require("aws-sdk");

exports.handler = function(event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  // Set region to the destination region where the user's bucket is hosted.
  //aws.config.update({region: event.ResourceProperties.S3Region})
  aws.config.update({region: event.ResourceProperties.S3Region})
  var responseData = {};
  var responseStatus = "FAILED";  // Start out with response of FAILED until we confirm SUCCESS explicitly.

  var s3 = new aws.S3();
  var srcS3Bucket = event.ResourceProperties.BucketName;  // S3 bucket where AWS has hosted the lab content
  var dstS3Bucket = event.ResourceProperties.WebsiteBucketCreatedEarlier;

  var keys = [
    "S3/index.html",
    "S3/assets/css/zombie.css",
    "S3/assets/images/aws-logo.png",
    "S3/assets/images/title.png",
    "S3/assets/images/username.png",
    "S3/assets/images/zombie-logo.png",
    "S3/assets/js/constants.js",
    "S3/app/app.js",
    "S3/app/controllers/chatMessageController.js",
    "S3/app/controllers/chatPanelController.js",
    "S3/app/controllers/talkersPanelController.js",
    "S3/app/controllers/loginController.js",
    "WK305_Gateway.zip",
    "ZombieGetMessages.zip",
    "ZombiePostMessage.zip",
    "IamUsers.zip"
  ];  // Objects that are copied from AWS to user's bucket

  // CloudFormation cannot delete S3 bucket if there are objects in it.
  // If DELETE request type is sent, delete the objects out of bucket, then log SUCCESS so Cloudformation can proceed.
  if (event.RequestType == "Delete") {
    var params = {
      Bucket: dstS3Bucket
    }

    s3.listObjects(params, function(err, data) {
      if (err) {
        responseData = {Error: 'Failed to get objects from bucket for deletion.'};
        console.log(responseData.Error + ':\\n', err);
      }

      params = {Bucket: dstS3Bucket};
      params.Delete = {};
      params.Delete.Objects = [];

      data.Contents.forEach(function(content) {
        params.Delete.Objects.push({Key: content.Key});
      });

      s3.deleteObjects(params, function(err, data) {
        if (err) {
          responseData = {Error: 'Failed to delete an object from bucket.'};
          console.log(responseData.Error + ':\\n', err);
        }
        else {
          console.log(data);
          responseStatus = "SUCCESS";
        }
        sendResponse(event, context, responseStatus, responseData);
      });
    });
  }

  else { // if request type is CREATE or UPDATE, we get files into user's S3 bucket.
    for (var i in keys) {
      var srcS3Key = keys[i];
      var dstS3Key = srcS3Key;

      // Post status message out.
      console.log("Copying '" + srcS3Key + "' from '" + srcS3Bucket + "' to '" + dstS3Bucket + "'");

      var params = {
        Bucket: dstS3Bucket,
        Key: dstS3Key,
        CopySource: (srcS3Bucket + '/' + srcS3Key),
        MetadataDirective: 'COPY'
      };
      // Copy the object from the source bucket
      s3.copyObject(params, function (err, data) {
        if (err) {
          responseData = {Error: 'Object ' + srcS3Key + ' failed to transfer to your bucket.'};
          console.log(responseData.Error + ':\\n', err);
          sendResponse(event, context, responseStatus, responseData);
        }
        else {
          responseStatus = "SUCCESS";
          console.log(data);
          sendResponse(event, context, responseStatus, responseData);
        }
      });
    }
  }
}

function sendResponse(event, context, responseStatus, responseData) {

  var responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: 'See the details in CloudWatch Log Stream: ' + context.logStreamName,
      PhysicalResourceId: context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: responseData
  });

  console.log('RESPONSE BODY:\n', responseBody);

  var https = require('https');
  var url = require('url');

  var parsedUrl = url.parse(event.ResponseURL);
  var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'PUT',
      headers: {
        "content-type": "",
        "content-length": responseBody.length
      }
  };

  console.log('SENDING RESPONSE...\n');

  var request = https.request(options, function(response) {
      console.log('STATUS: ' + response.statusCode);
      console.log('HEADERS: ' + JSON.stringify(response.headers));
      context.done();
  });

  request.on('error', function(error) {
    console.log('sendResponse Error:' + error);
    context.done();
  });

  request.write(responseBody);
  request.end();
}
