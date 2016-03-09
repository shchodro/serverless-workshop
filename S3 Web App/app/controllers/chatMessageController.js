myApp.controller('chatMessageCtrl', ['$scope', '$rootScope', '$resource', function($scope, $rootScope, $resource) {

  $rootScope.$on("chatting", function() {
    document.getElementById('chat-message-input').placeholder = "Enter a message and save humanity";
  });
  $rootScope.$on("not chatting", function() {
    document.getElementById('chat-message-input').value = null;
    document.getElementById('chat-message-input').placeholder = "Save your brains, enter your user name";
  });

  $scope.lastTalking = new Date;

  $scope.chatMessageKeyPressed = function(keyEvent) {
    if (keyEvent.which === 13) {
      $scope.posting = true;
      console.log('Sending Message: ' + $scope.chatMessage);
      var PostMessages = $resource(MESSAGES_ENDPOINT);
      var message = {
        channel: 'default',
        name: document.getElementById('name-input').value,
        message: $scope.chatMessage
      };

      PostMessages.save(message, function() {
        $scope.chatMessage = null;
        $scope.posting = false;
      })
    } else {
      var diff = Date.now() - $scope.lastTalking;
      console.log(diff);

      // send talking update at max every .5 seconds
      if (diff < 500) {
        return;
      }

      var PostTalkers = $resource(MESSAGES_ENDPOINT.replace("/message", "/talkers"))

      var message = {
        channel: 'default',
        name: document.getElementById('name-input').value
      };

      console.log('Posting to talkers.');
      PostTalkers.save(message, function() {
        $scope.lastTalking = new Date;
      });
    }
  };

}]);
