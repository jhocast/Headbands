var gameInfra = io.connect('/game_infra'),
    gameCom = io.connect('/game_com');

var roomName = decodeURI(
  (RegExp("room" + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);

if (roomName) {
  console.log('Inside roomName-----------------------------------------------', roomName);
  gameInfra.emit('join_room', {'name':roomName});
  
  gameInfra.on('name_set', function (data) {
    gameInfra.on("user_entered", function (user) {
      console.log('Inside user_entered +_+_++_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_');
      if (roomName===user.room) {
        $('#messages').append('<div class="systemMessage">' + user.name + 
        ' has joined the room. ' + roomName + '</div>');
      }
      for (var player in user.currentPlayers) {
        if (player) {
          var thisPlayer = '#player' + player.toString(),
            thisPoint = '#points' + player.toString();
          $(thisPlayer).text("Player: " + user.currentPlayers[player].username);
          var newValPt = "Points: " + user.currentPlayers[player].CurrentGame.Points.toString(),
            htmlObjOne = '<li id="' + thisPoint +  '">' + newValPt + '</li>';
          $(thisPlayer).append(htmlObjOne);
          $('#answerit').hide();
        }
      }
      if (user.emitAt=='User') $('#this_user').text(user.name);
      console.log('Getting out of user_entered +_+_++_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_');
    });
    
    gameInfra.on('message', function (message) {
      var jmessage = JSON.parse(message);
      $('#messages').append('<div class="' + jmessage.type + '">' + jmessage.message + '</div>');
    });

    gameCom.on('message', function (message) {
      var jmessage = JSON.parse(message);
      $('#messages').append('<div class="' + jmessage.type + '"><span class="name">' + 
        jmessage.username + ':</span> ' + jmessage.message + '</div>');
    });

    $('#nameform').hide();
    $('#messages').append('<div class="systemMessage">Hello ' + data.name + '</div>');
	

    $('#send').click(function () {
      var data = { message:$('#message').val(), type:'userMessage' };
      gameCom.send(JSON.stringify(data));
      $('#message').val('');
    });  
    
    $('#answerit').click(function () {
      console.log('Just clicked on #answerit----------------------------------||');
      var s = prompt('Submit your Guess'),
        data = { message: "User Guess is: " + s, type:'userMessage', 
          'roomName' :roomName, guess: s 
        };
      console.log('Calling <<<<<<<gameInfra.emit("check_answer", data);>>>>>>>>>>\n');
      gameInfra.emit("check_answer", data);
      gameCom.send(JSON.stringify(data));
      $('#message').val('');
      console.log('Just got out of #answerit----------------------------------||');
    });
    
    $('#letsStart').click(function () {
      alert($('#letsStart').val());
      if ($('#letsStart').val() == 'Start Game') {
        console.log("Calling <<<<<<<gameInfra.emit('starting_game', {'name':roomName});>>>>>>>>>>\n");
        gameInfra.emit('starting_game', {'name':roomName});
        var data = { message:'Game is starting', type:'userMessage' };
        gameCom.send(JSON.stringify(data));
        $('#message').val('');
      } else {
        console.log("It is a restart");
        console.log($('#letsStart').val());
      }
    });
  });
}

$(function () {
  $('#setname').click(function () {
    gameInfra.emit("set_name", {name:$('#nickname').val()});
  });
});
