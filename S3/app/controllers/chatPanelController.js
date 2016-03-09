
myApp.controller('chatPanelCtrl', ['$scope', '$rootScope', '$resource', '$timeout', function($scope, $rootScope, $resource, $timeout) {

    $rootScope.$on("chatting", function() {
        var Messages = $resource(MESSAGES_ENDPOINT);

        var poll = function() 
        {
            $timeout(function() {
                if($rootScope.chatting)
                {
                    console.log('Retrieving Messages from Server');
                    Messages.get(null, function(messages) {
                        if($rootScope.chatting)
                        {
                            $scope.messages = messages.messages;
                        }
                        else
                        {
                            //just in case, for cleanup
                            $scope.messages = null;
                        }
                     });
                    poll();
                }
            }, 2000);
        };     
        poll();
    });
    $rootScope.$on("not chatting", function() {
        //clear our model, which will clear out the messages from the panel
     		$scope.messages = null;
    });
    
}]);