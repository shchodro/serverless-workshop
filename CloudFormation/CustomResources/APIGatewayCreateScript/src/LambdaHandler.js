/**
 * New node file
 */

var AWS = require('aws-sdk');
var apigatewaycreate = require('./ApiGatewayCreate');
var apigatewaydelete = require('./ApiGatewayDelete');
var cloudformationsender = require('./cloudformationsender');
var zombieconfigupdater = require('./ZombieWebsiteConfigUpdate');

var theRegion;
var theS3Bucket;
var theS3Key
var theEvent;
var theContext;

exports.handleGatewayEvent = function(event, context)
{

	theEvent = event;
	theContext = context;
	
	if(event.RequestType == 'Create')
	{
		theRegion = event.ResourceProperties.region;
		theS3Bucket = event.ResourceProperties.s3bucket;
		theS3Key = event.ResourceProperties.s3key;
		
		AWS.config.update({region: theRegion});
		
		apigatewaycreate.createGateway(event, context, createApiGatewayCallback);
	}
	else if(event.RequestType == 'Delete')
	{
		apigatewaydelete.deleteGateway(event, context, finishedUpdatingCallback);
	}
	else
	{
		console.log(event);
		console.log('non-create requst type, sending suceed');
		cloudformationsender.sendResponse(event, context, "SUCCESS", {});
	}
}

function createApiGatewayCallback(err, restAPIId)
{
	if(err)
	{
		console.log(err, err.stack);
		cloudformationsender.sendResponse(theEvent, 
	            theContext, "FAILED", {});
	}
	else
	{
		var url = "https://" + restAPIId + ".execute-api." + theRegion + 
		".amazonaws.com/ZombieWorkshopStage/zombie/message";
		
		console.log("calling s3 helper to create constants with url: " + url);
		
		zombieconfigupdater.updateConfig(theRegion,
										 theS3Key,
										 theS3Bucket,
										 url,
										 finishedUpdatingCallback);
	}
}

/**
 * callback that looks if it's an error and updates cloudformation appropriately...
 * @param err
 */
function finishedUpdatingCallback(err)
{

	if(err)
	{
		cloudformationsender.sendResponse(theEvent, 
	            theContext, "FAILED", {});
	}
	else
	{	
		cloudformationsender.sendResponse(theEvent, 
	            theContext, "SUCCESS", {});
	}
}