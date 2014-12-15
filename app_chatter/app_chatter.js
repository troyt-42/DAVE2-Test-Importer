
var chatter = angular.module("chatApp", []);

var chatController = chatter.controller('chatController',['$scope','daveSocket','$http', function($scope,daveSocket,$http){

	$scope.nickname = window.prompt("What's your nickname?");

	$scope.getRandomColor = function() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	$scope.color = $scope.getRandomColor();

	$scope.sendMessage = function(message){
		if ($scope.nickname === null) {
			$scope.nickname = window.prompt("What's your nickname?");
		}

		daveSocket.emit("messages",$scope.nickname,message,$scope.color);

		var date = new Date().toString();
		var newGuy = document.createElement("div");
		var newLine = document.createElement("div");
		var elem = document.getElementById("chatWindow");
		newGuy.setAttribute("class","peopleName");
		newGuy.innerHTML =  $scope.nickname + "@" + date + ":";
		newLine.innerHTML = message;

		newGuy.setAttribute("class","peopleName");
		newGuy.style.color = $scope.color;

		elem.appendChild(newGuy);
		elem.appendChild(newLine);
	};

	daveSocket.on("messages",function(nickname,message,color){
		var newGuy = document.createElement("div");
		var newLine = document.createElement("div");
		var date = new Date().toString();
		var elem = document.getElementById("chatWindow");
		newGuy.setAttribute("class","peopleName");
		newGuy.innerHTML =  nickname + "@" + date + ":";
		newLine.innerHTML = message;

		newGuy.setAttribute("class","peopleName");
		newGuy.style.color = color;

		elem.appendChild(newGuy);
		elem.appendChild(newLine);
	});

	$http.get("/getHistoryMessages")
	.success(function(data){
		if(data){
			console.log(data);

			for(var key in data){

				var newGuy = document.createElement("div");
				var newLine = document.createElement("div");
				var date = new Date().toString();
				var elem = document.getElementById("chatWindow");

				newGuy.setAttribute("class","peopleName");
				newGuy.innerHTML =  data[key].nickname + "@" + date + ":";
				newLine.innerHTML = data[key].message;

				newGuy.setAttribute("class","peopleName");
				newGuy.style.color = data[key].color;

				elem.appendChild(newGuy);
				elem.appendChild(newLine);
			}
		}
	});


}]);

/*
var server = io.connect('http://localhost:8080');
var nickname = prompt("What's your nickname?");



$scope.getRandomColor = function() {
var letters = '0123456789ABCDEF'.split('');
var color = '#';
for (var i = 0; i < 6; i++ ) {
color += letters[Math.floor(Math.random() * 16)];
}
return color;
}

var ownColor = getRandomColor();

$scope.sendMessage = function(){
var message = document.getElementById("chat").value;
server.emit('messages',message,nickname,ownColor);

};

server.emit("retrive");

server.on("messages", function(data,name,color){
var date = new Date().toString();
var elem = document.getElementById("chatWindow");
console.log(data + ' ' + nickname);

var newpeople =document.createElement("div");
var newline = document.createElement("div");

newpeople.setAttribute("class","peopleName");
newpeople.style.color = color;
newpeople.innerHTML =  name + "@" + date + ":";
newline.setAttribute("class","line");
newline.innerHTML = data;

elem.appendChild(newpeople);
elem.appendChild(newline);
});

*/
