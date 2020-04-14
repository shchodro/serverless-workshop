const AWS = require('aws-sdk'); //require AWS SDK
const topicArn = "COPY ARN HERE";
const cities = 
  [ 
    ["London",51.507351,-0.127758],
    ["Las Vegas",36.169941,-115.139830],
    ["New York",40.712784,-74.005941],
    ["Singapore",1.352083,103.819836],
    ["Sydney",-33.867487,151.206990],
    ["Paris",48.856614,2.352222],
    ["Seattle",47.606209,-122.332071],
    ["San Francisco",37.774929,-122.419416],
    ["Montreal",45.501689,-73.567256],
    ["Rio De Janeiro",-22.906847,-43.172896],
    ["Beijing",39.904211,116.407395],
    ["Moscow",55.755826,37.617300],
    ["Buenos Aires",-34.603684,-58.381559],
    ["New Dehli",28.613939,77.209021],
    ["Cape Town",-33.924869,18.424055],
    ["Lagos",6.524379,3.379206],
    ["Munich",48.135125,11.581981]
  ]

  exports.handler = function(event, context) {
    let randomNumber =  Math.random() * (15 - 0 + 1) + 0;
    let roundedNumber = Math.round(randomNumber);
    let city = cities[roundedNumber][0];
    let value = (Math.random() * Math.random())*1000;
    let lon = cities[roundedNumber][2];
    let lan =  cities[roundedNumber][1];
    var message = `{"message": "A zombie has been detected in ${city}","value":"${value}","city":"${city}","longitude":"${lon}","latitude":"${lan}" }`;
    var sns = new AWS.SNS();
      var params = {
          Message: message, 
          Subject: "Zombie Alert",
          TopicArn: topicArn
      };
      console.log(message);
      sns.publish(params, context.done);
  };