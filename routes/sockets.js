var monk = require('monk'),
  db = monk('localhost:27017/projectTwo'),
  io = require('socket.io');

exports.initialize = function (server) {
  io = io.listen(server, {log: false});
  
  io.set('authorization', function (data, accept) {
    console.log('authorizing');
    if (data.headers.cookie) {
      data.cookie = require('cookie').parse(data.headers.cookie);
      data.sessionID = data.cookie['express.sid'].split('.')[0];
      data.nickname = data.cookie.nickname;
    } else {
      return accept('No cookie transmitted.', false);
    }
    accept(null, true);
  });
  var self = this;
  
  this.gameInfra = io.of("/game_infra");
  this.gameInfra.on("connection", function (socket) {
    console.log("going into connection ++++++++++________+++++++++++++++++++++++++");
    socket.on("join_room", function (room) {
      console.log('Entering join_room_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_||||');
      var nickname = socket.handshake.nickname, msg = 'Thank you for joining';
      socket.set('nickname', nickname, function () {
        socket.emit('name_set', {'name': nickname});
        socket.send(JSON.stringify({type:'serverMessage', message: msg}));
        socket.join(room.name);
        var comSocket = self.gameCom.sockets[socket.id], colUsers = db.get('users'),
          colThings = db.get('things');
        comSocket.join(room.name);
        comSocket.room = room.name;
        colUsers.find({ "CurrentGame.Name" : room.name },{}, function(e,usrs){
          colThings.find({},{}, function(e, thing){
            var lIndex = Math.floor(Math.random() * thing.length);
            var record = {
            "username": nickname, "userstate": 'Joined Game', "LastLoggedIn" : new Date(),
            "CurrentGame" : { Name: room.name, Points: 0, Wins: 0, 
              GameOrder: usrs.length + 1, PrivateId : thing[lIndex].Name }
            };
            colUsers.insert(record, function(err, doc) {
              if(err) {
                console.log("There was error inserting record into database");
              } else {
                console.log("Successfully entered record, got response\n", doc);
                colUsers.find({ "CurrentGame.Name" : room.name },{}, function(e,usrs){
                  var currentPlayers = { };
                  for (var rec in usrs) {
                    if (rec) {
                      var curOrder = usrs[rec].CurrentGame.GameOrder;
                      console.log('curOrder', curOrder);
                      currentPlayers[curOrder] = usrs[rec];
                    }
                  }
                  var roomStats = { 'name': nickname, 'room': room.name, 'Players': usrs.length, 
                    'currentPlayers': currentPlayers
                  };
                  roomStats.emitAt = 'User';
                  socket.emit('user_entered', roomStats);
                  roomStats.emitAt = 'Others';
                  socket.set('roomStats', roomStats, function() {
                    console.log('just set roomStats at join_room----------->>\n', roomStats);
                    socket.in(room.name).broadcast.emit('user_entered', roomStats);
                    console.log("room list after calling socket.in(room.name).broadcast.emit('user_entered', roomStats);\n", roomStats);
                  });
                });
              }
            });
          });
        });
      });
    });

    socket.on("get_rooms", function(){
      console.log("Going into get_rooms<<<<<<<------------------------------------------");
      var rooms = {};
      for(var room in io.sockets.manager.rooms){
        if(room.indexOf("/game_infra/") === 0){
          var roomName = room.replace("/game_infra/", "");
          rooms[roomName] = io.sockets.manager.rooms[room].length;
        }
      }
      socket.emit("rooms_list", rooms);
      console.log("Getting out of get_rooms<<<<<<<<------------------------------------");
    });
    
    socket.on("starting_game", function(room) {
      console.log('Going thru starting_game---------------------<<<<<<<<<<< for room', room);
      var colUsers = db.get('users');
      colUsers.find({ "CurrentGame.Name" : room.name },{}, function(e,usrs){
        var currentPlayers = { }, curPlayer = 0;
        for (var rec in usrs) {
          if (rec) {
            console.log('rec', rec);
            var curOrder = usrs[rec].CurrentGame.GameOrder;
              console.log('curOrder', curOrder);
              currentPlayers[curOrder] = usrs[rec];
            if (usrs[rec].name===socket.handshake.nickname) {
              curPlayer = rec;
            }
          }
        }
        var activePlayer = {'name': socket.handshake.nickname,  'slot': curPlayer},
          roomStats = { 'name': socket.handshake.nickname, 'room': room.name, 
            'Players': usrs.length, 'currentPlayers': currentPlayers, 
            'activePlayer': activePlayer
        };
        console.log("roomStats when saved from database++++++++++++++++++++>\n", roomStats);
        //var colThings = db.get('things');
        //colThings.find({},{}, function(e, thing){
        //for (var player in roomStats.currentPlayers) {
        //  if (player) {
            //var lIndex = Math.floor(Math.random() * (thing.length - 1));
            //roomStats.currentPlayers[player].PrivateId = thing[lIndex].Name;
            
        //    if (socket.handshake.nickname == roomStats.currentPlayers[player].Name) {
        //      console.log("going thru players in roomstats", player);
        //      roomStats.activePlayer = { 'name': socket.handshake.nickname, 'slot': player};
        //    }
        //  }
        //}
        console.log("roomStats after getting things++++++++++++++++++++>\n", roomStats);
        socket.set('roomStats', roomStats, function() {
          socket.emit("display_room", roomStats);
          socket.in(room.name).broadcast.emit("display_room", roomStats);
          console.log('Getting Out of  starting_game---------------------------------');
        });
		//});
      });
    });

    socket.on("check_answer", function(answer) {
      console.log('Going into check_answer___________________________for:', answer);
      var colUsers = db.get('users'),
        filter = { "username": socket.handshake.nickname, 
          "CurrentGame.Name" : answer.roomName };
      colUsers.find({"CurrentGame.Name" : answer.roomName},{}, function(e,recs){
        colUsers.find(filter,{}, function(e,usrs){
          for (var rec in usrs) {
            if (rec) {
              console.log('privateId---------------->', usrs[rec].CurrentGame.PrivateId);
              var result = { response : (usrs[rec].CurrentGame.PrivateId == answer.guess),
                playerSlot : usrs[rec].CurrentGame.GameOrder, playerCount: recs.length, 
                room : answer.roomName, alertWho : 'user'};
              console.log("Here is the response", result);
              socket.emit("answer_response", result);
              result.alertWho = 'others';
              socket.in(answer.roomName).broadcast.emit("answer_response", result);
            }
          }
        });
      });
    });
    
    socket.on("next_player", function(data) {
      console.log("Going into next_player---------------------------------<next_player>");
      socket.get('roomStats', function(err, roomStats) {
        console.log('roomStats before change\n', roomStats);
        var nextPlayer = (data.playerSlot % data.playerCount) + 1,
          PlayerData = { 'oldPlayer': data.playerSlot, 
          'newPlayer': nextPlayer,
          'currentPlayer': socket.handshake.nickname
        };
        var newPlayer = { 'name': PlayerData.currentPlayer, 'slot': PlayerData.newPlayer};
        roomStats.activePlayer = newPlayer;
        //var room = roomStats.currentPlayers[nextPlayer].GameId;
        socket.set('roomStats', roomStats, function() {
          socket.emit("move_to_next_player", PlayerData);
          socket.in(data.room).broadcast.emit("move_to_next_player", PlayerData);
          console.log('roomStats value getting out\n', roomStats);
          console.log("Getting out of next_player---------------------------------<next_player>");
        });
      });
    });
    console.log("going out of connection_++++++++++________+++++++++++++++++++++++++");
  
    socket.on("disconnect", function() {
      var colUsers = db.get('users'),
        thisUser = socket.handshake.nickname, 
        thisRoom = socket.handshake.cookie.RoomName,
        filter = { "username": thisUser, 
          "CurrentGame.Name" : thisRoom };
      colUsers.remove(filter,{}, function(e,removed){
        console.log("just disconnected", removed);
        var filterRoom = { "CurrentGame.Name" : thisRoom };
		colUsers.find(filterRoom,{}, function(e,usrs){
          var currentPlayers = { };
          for (var rec in usrs) {
            if (rec) {
              console.log('rec', rec);
              var curOrder = usrs[rec].CurrentGame.GameOrder;
              currentPlayers[curOrder] = usrs[rec];
            }
          }
          var roomStats = { 'name': thisUser, 
            'room': thisUser, 'Players': usrs.length, 
            'currentPlayers': currentPlayers
          };
          console.log("Will rebuild after deleting with the following", roomStats);
          socket.in(thisRoom).broadcast.emit("user_left", roomStats);
        });
      });
    });
    
  });
  
  this.gameCom = io.of("/game_com");
  this.gameCom.on("connection", function (socket) {
    socket.on('message', function (message) {
      message = JSON.parse(message);
      if (message.type == "userMessage") {
        socket.get('nickname', function (err, nickname) {
          message.username = nickname;
          socket.in(socket.room).broadcast.send(JSON.stringify(message));
          message.type = "myMessage";
          socket.send(JSON.stringify(message));
        });
      }
    });
  });
};