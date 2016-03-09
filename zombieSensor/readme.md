# Creating the Zombie Sensor
If you wish to also utilise the Zombie Sensor as part of your workshop. This guide will walk you through this. Please note that this requires purchasing some additonal physical equipment. 

This guide will walk through the following:

* Items required to create the physical Zombie sensor
* How to create the AWS backend (Simple Notification Service Topic) for the Zombie detector
* How to install the code in the repo on to the device

The applciation code here is a very simple app that publishes a message to an Amazon Simple Notification Service (SNS) queue when motion is detected on the Grove PIR Motion Sensor. For the purpose of a workshop, this should be done only once in a central account by the workshop organiser, the topic will be made public so that the various teams are able to subscribe to this topic and make use of it during the workshop. 

It uses a static array of cities and selects one by random to include in the message, along with lattitue and longitude of that city. An example message is below. Workshop attendees can then do something meaningful with the data using AWS lambda in their own AWS accounts. Maybe try to publish the messages into the group chat or go one step further and create a realtime global zombie heatmap.

```
{"message":"A Zombie has been detected in London!", "value":"1", 
"city":"London", "longtitude":"-0.127758", "lattitude":"51.507351"}
```

A simple workflow of this architecture is:

Edison -> Public SNS topic in central account -> Attendees AWS Lambda functions subscribed to the topic.


## Items Required
1. One Intel® Edison and Grove IoT Starter Kit Powered by AWS. This can be purchased [here](http://www.amazon.com/gp/product/B0168KU5FK?*Version*=1&*entries*=0).

2. The item's in the starter kit that you will need to use for this project are:

	1. Intel® Edison for Arduino
	2. Base Shield
	3. USB Cable; 480mm-Black x1
	4. USB Wall Power Supply x1
	5. Grove - PIR Motion Sensor


## Creating the AWS Backend
1. Firstly, you will need to have an AWS Account. If you do not already have one, you can sign up [here](https://aws.amazon.com).

3. Next, we will create the SNS Topic. Navigate to the SNS product page within the AWS Management Console and click 'Topics' in the left hand menu. Then click on 'Create New Topic'. You will be presented with the following window. Fill in the fields with your desired values and click create topic.

![Create Topic Screenshot](screenshots/createTopic.png)

4. You will now need to edit the topic polciy to permit any AWS account to subscribe lambda functions to your SNS topic. Check the check box next to your new topic, and then click Actions -> Edit topic policy. You need to configure these settings presented as per the below screenshot. Then click Update Policy.

![Edit Topic Policy Screenshot](screenshots/createTopicPolicy.png)

5. You now have your central SNS topic configured and ready to use. Ensure that you make a note of the Topic ARN and region where you have created the topic, you will need it in some of the following steps.


## Installing the application on the Intel Edison

1. Firstly you will need to get your Edison board set up. You can find a getting started guide for this on the Intel site [here](https://software.intel.com/en-us/articles/assemble-intel-edison-on-the-arduino-board).   
Note that for the purpose of this tutorial, we will be writing our client code for the Edison in node.js and will therefore be using the Intel® XDK for IoT (referred to as 'XDK' from here on) as our IDE.

2. You will need to physically connect the Grove PIR Motion Sensor to pin D6 on the breakout board.  

2. Download all of the code from the 'zombieIntelEdisonCode' folder 'in this repository and store it in a folder locally on your machine. this simply consists of a main.js file (our  applicaiton) and our package.json (our app dependencies).  

3. Navigate to the homepage in the XDK and start a new project.  

4. Choose to import an existing Node.js project and select the folder where you stored the code from this repository in the previous step.  

5. Give your project a name. We called ours zombieSensor  

6. You now need to edit the code in main.js to include your AWS credentials and the SNS topic that you have created.  Firstly, we'll need some AWS credentials. 

7. You will need to create an IAM user with Access and Secret Access Keys for your Edison to publish messages to your SNS topic. There is a guide on how to create IAM users [here](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html), your IAM policy for the user should look like the following: 

```
{
  "Version": "2012-10-17",
  
  "Statement": [
    {
      "Action": [
        "sns:Publish"
      ],
      "Effect": "Allow",
      "Resource": "ENTER YOUR SNS TOPIC ARN HERE"
    }
  ]
}
```

7. Now let's add your credentials to the client side code. Edit the following line in main.js to include your user access keys and the region where you have set up your SNs topic. 

```
AWS.config.update({accessKeyId: 'ENTER ACCESSKEY HERE', secretAccessKey: 'ENTER SECRET ACCESS KEY HERE', region: 'ENTER REGION HERE'});
```

8. Edit the following line in main.js to reflect the region in which you created the SNS topic.  

```
var sns = new AWS.SNS({region: 'ENTER REGION HERE'}); 
```  

9. Edit the following line in main.js to reflect the Amazon resource name (ARN) of the SNS topic that you created earlier.

```
TopicArn: "ENTER YOUR SNS TOPIC ARN HERE"
```  

10. You now need to connect the XDK to your Intel Edison device. There is a guide on the Intel site on how to do this [here](https://software.intel.com/en-us/getting-started-with-the-intel-xdk-iot-edition) under the 'Connect to your Intel® IoT Platform' section.  

11. You now need to build the app and push it to your device. Firstly hit the build/install icon, this looks like a hammer in the XDK. It may take a couple of minutes to install the required packages etc.

12. Once the app has been built succesfully, you can run the app by pressing the run icon, this looks like a circuit board with a green 'play' sign.

13. Your app should now be running on the Edison device and your messages being published to the SNS topic. you can now consume this topic and do something meaningful with the Zombie alerts. You can consume these messages using AWS Lambda. There is some documentation to get you started [here](http://docs.aws.amazon.com/sns/latest/dg/sns-lambda.html). Have fun!!

## Consuming the SNS Topic with AWS Lambda

To help you get started consuming the Zombie alert data, We have created a sample lambda function in node.js that, once siubscribed to the SNS topic as per the above mentioned documentation, simply consumes the messages and logs them to Cloudwatch logs. 

This sample can be found in this repository under lambda/exampleSNSFunction.js
  