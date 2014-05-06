console.log('Running game.js-------------------------------------------------');
var gameInfra = io.connect('/game_infra'),
    gameCom = io.connect('/game_com');

var roomName = decodeURI(
  (RegExp("room" + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);

if (roomName) {
  console.log('Inside roomName-----------------------------------------------', roomName);
  gameInfra.emit('join_room', {'name':roomName});

  gameInfra.on('name_set', function (data) {
    gameInfra.on("user_entered", function (user) {
      if (roomName===user.room) {
        $('#messages').append('<div class="systemMessage">' + user.name 
          + ' has joined the room. ' + roomName + '</div>');
      }
    });

    gameInfra.on('message', function (message) {
      var message = JSON.parse(message);
      $('#messages').append('<div class="' + message.type + '">' + message.message + '</div>');
    });

    gameCom.on('message', function (message) {
      var message = JSON.parse(message);
      $('#messages').append('<div class="' + message.type + '"><span class="name">' + 
        message.username + ':</span> ' + message.message + '</div>');
    });

    $('#nameform').hide();
    $('#messages').append('<div class="systemMessage">Hello ' + data.name + '</div>');

    $('#send').click(function () {
      var data = { message:$('#message').val(), type:'userMessage' };
      chatCom.send(JSON.stringify(data));
      $('#message').val('');
    });
  });
}

$(function () {
  $('#setname').click(function () {
    gameInfra.emit("set_name", {name:$('#nickname').val()});
  });
});