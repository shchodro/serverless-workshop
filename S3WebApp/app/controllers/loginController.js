myApp.controller('usernameSectionCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.userName = 'Enter UserName';

    $scope.toggleChatting = function() {
    	if($rootScope.chatting)
    	{
	    	$scope.logoff();
    	}
    	else
    	{
	    	$scope.login();
    	}
    };

    $scope.login = function() {
    	$rootScope.chatting = true;
    	$rootScope.$emit('chatting');
    	//document.getElementById('name-input').disabled = true;
    	document.getElementById('chat-toggle').value = "Stop Chatting";
    };

    $scope.logoff = function() {
    	document.getElementById('chat-toggle').value = "Start Chatting";
    	//document.getElementById('name-input').disabled = false;
        $rootScope.chatting = false;
        $rootScope.$emit('not chatting');
    };
}]);