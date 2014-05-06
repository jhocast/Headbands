var io = require('socket.io');

exports.initialize = function (server) {
  io = io.listen(server);
  
  io.set('authorization', function (data, accept) {
    console.log('authorizing');
    if (data.headers.cookie) {
      data.cookie = require('cookie').parse(data.headers.cookie);
      data.sessionID = data.cookie['express.sid'].split('.')[0];
      data.nickname = data.cookie['nickname'];
    } else {
      return accept('No cookie transmitted.', false);
    }
    accept(null, true);
  });
  
  var self = this;

  this.gameInfra = io.of("/game_infra");
  this.gameInfra.on("connection", function (socket) {
    socket.on("join_room", function (room) {
      var nickname = socket.handshake.nickname, 
        msg = 'Welcome to gameroom';
      socket.set('nickname', nickname, function () {
        socket.emit('name_set', {'name': nickname});
        socket.send(JSON.stringify({type:'serverMessage', message: msg}));
          socket.join(room.name);
          var comSocket = self.GameCom.sockets[socket.id];
          comSocket.join(room.name);
          comSocket.room = room.name;
          socket.in(room.name).broadcast.emit('user_entered', 
            {'name':nickname, 'room': room.name});
      });
    });

    socket.on("get_rooms", function(){
      console.log("get_rooms being called------------------------------------------");
      var rooms = {};
      for(var room in io.sockets.manager.rooms){
        if(room.indexOf("/game_infra/") == 0){
          var roomName = room.replace("/game_infra/", "");
          rooms[roomName] = io.sockets.manager.rooms[room].length;
        }
      }
      socket.emit("rooms_list", rooms);
    });
  });

  this.gameCom = io.of("/game_com");
  this.gameCom.on("connection", function (socket) {
    socket.on('message', function (message) {
      console.log("message for room----------------------------", socket.room);
      message = JSON.parse(message);
      if (message.type == "userMessage") {
      	console.log("It is a user message");
        socket.get('nickname', function (err, nickname) {
          message.username = nickname;
          socket.in(socket.room).broadcast.send(JSON.stringify(message));
          message.type = "myMessage";
          socket.send(JSON.stringify(message));
        });
      }
    });
  });
}