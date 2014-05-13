var gameInfra = io.connect('/game_infra');

gameInfra.on("connect", function(){
  console.log("Going thru inside of connect-----------------------------------------");
  gameInfra.emit("get_rooms", {});
  gameInfra.on("rooms_list", function(rooms){
    console.log('Entering rooms_list------------------------------>>>>>');
    for(var room in rooms) {
      if (room) {
        var roomDiv = '<div class="room_div"><span class="room_name">' + 
          room + '</span><span class="room_users">[ ' + rooms[room] + ' Users ] </span>' + 
          '<a class="room" href="/gameroom?room=' + room + '">Join</a></div>';
        $('#rooms_list').append(roomDiv);
      }
    }
    console.log('Getting out of rooms_list------------------------------>>>>>');
  });
  
  gameInfra.on("display_room", function(datasets){
    console.log('Entering display_room------------------------->>>>>', datasets);
    var currentUser = datasets.name;
    for (var thisplayer in datasets.currentPlayers) {
      if (thisplayer) {
        var player = '#player' + thisplayer.toString(),
          thisId = '#id' + thisplayer.toString();
        if ($(player).text().indexOf(currentUser)>=0) {
          $(player).css('background-color', 'lightblue');
        }
        if (currentUser==$('#this_user').text()) {
          $('#answerit').show();
        } else {
          $('#answerit').hide(); 
        }
        if ($(player).text().indexOf($('#this_user').text())<0) {
          var privId = datasets.currentPlayers[thisplayer].CurrentGame.PrivateId,
            htmlObjTwo = '<li id="' + thisId +  '">' + privId + '</li>';
          $(player).append(htmlObjTwo);
        }
      }
    }
    $('#letsStart').hide();
    $('#headerOne').text(currentUser + ': needs clues provided.');
    console.log('Getting out of things_list------------------------------>>>>>');
  });     
  
  gameInfra.on("answer_response", function(data) {
    console.log('Getting into answer_response------------------------------>>>>>');
    if (data.response) {
      if (data.alertWho ==='user') {
        alert("You are a game winner, your answer was correct: ");
        $('#letsStart').show();
        $('#answerit').hide(); 
      } else {
        alert("User guess was correct, game is over.");
      }
    } else {
      alert("Your Guess is incorrect!  Moving on to the next player ");
      console.log('calling <<<<<<<<<<<<gameInfra.emit("next_player", {});>>>>>>>>>>>>>>');
      gameInfra.emit("next_player", data);
      console.log('coming back from Calling <<<<>>>>>>>>>>>>>>');
      
    }
    console.log('Getting out of answer_response------------------------------>>>>>');
  });
  
  gameInfra.on("move_to_next_player", function(data) {
    console.log('Getting into move_to_next_player------------------------------>>>>>', data);
    var oldplayer = '#player' + data.oldPlayer.toString(),
      newplayer = '#player' + data.newPlayer.toString();
    $(oldplayer).css('background-color', 'beige');
    $(newplayer).css('background-color', 'lightblue');
    $('#headerOne').text(data.currentPlayer + ': needs clues provided.');
    if (data.currentPlayer==$('#this_user').text()) $('#answerit').show();
    else $('#answerit').hide();
    console.log('Getting out of move_to_next_player------------------------------>>>>>');
  });
  
  
  gameInfra.on("user_left", function(user) {
    for (var player in user.currentPlayers) {
      if (player) {
        var thisPlayer = '#player' + player.toString(),
          thisPoint = '#points' + player.toString();
        $(thisPlayer).text("Player: " + user.currentPlayers[player].username);
          var newValPt = "Points: " + user.currentPlayers[player].CurrentGame.Points.toString(),
            htmlObjOne = '<li id="' + thisPoint +  '">' + newValPt + '</li>';
        $(thisPlayer).append(htmlObjOne);
      }
    }
  });
  console.log("Getting out of connect-----------------------------------------");
});

$(function(){
  $('#new_room_btn').click(function(){
    console.log("going to run new room button");
    document.cookie = "RoomName=" + $('#new_room_name').val();
    window.location = '/gameroom?room=' + $('#new_room_name').val();
  });
});