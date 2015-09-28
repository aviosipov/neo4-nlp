var app = angular.module('myApp', []);

app.controller('mainCtrl', function($scope,$http) {

	$scope.userInput = "" ; 
	$scope.userTextInput = "" ; 

	$scope.submitText = function() {

		$scope.sendRequest('parse_text' , $scope.userTextInput) ;
		$scope.userTextInput = "" ;

	}

	$scope.sendRequest = function(service,data) {


		var request = $http({
            method: "post",
                url: "/" + service ,
                data: {                   
                    text : data ,                    
                }
        });

		request.success(
			function( html ) {		    	
		    	console.log(html) ; 
			}
		);        


	}
    
	$scope.submitLine = function(event){

    	if (event.keyCode === 13) {

    		$scope.sendRequest('parse_line' , $scope.userInput) ;
    	    $scope.userInput = '';

	    }

	}


});