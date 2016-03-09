
myApp.controller('talkersPanelCtrl', ['$scope', '$rootScope', '$resource', '$timeout', function($scope, $rootScope, $resource, $timeout) {

    $rootScope.$on("chatting", function() {
        var Talkers = $resource(MESSAGES_ENDPOINT.replace("/message", "/talkers"));

        var poll = function()
        {
            $timeout(function() {
                if($rootScope.chatting)
                {
                    console.log('Retrieving Talkers from Server');
                    Talkers.get(null, function(talkers) {
                      console.log(talkers.Talkers);
                        if($rootScope.chatting)
                        {
                            $scope.talkers = talkers.Talkers;
                        }
                        else
                        {
                            //just in case, for cleanup
                            $scope.talkers = null;
                        }
                     });
                    poll();
                }
            }, 1000);
        };
        poll();
    });
    $rootScope.$on("not chatting", function() {
        //clear our model, which will clear out the messages from the panel
     		$scope.talkers = null;
    });

}]);
