var chatInfra = io.connect('/chat_infra');

chatInfra.on("connect", function(){
  console.log("Going to emit get_rooms-----------------------------------------");
  chatInfra.emit("get_rooms", {});
  chatInfra.on("rooms_list", function(rooms){
    for(var room in rooms){
      var roomDiv = '<div class="room_div"><span class="room_name">'
        + room + '</span><span class="room_users">[ ' + rooms[room] + ' Users ] </span>'
        + '<a class="room" href="/gameroom?room=' + room + '">Join</a></div>';
      $('#rooms_list').append(roomDiv);
    }
  });
});

$(function(){
  console.log("going to run new room button");
  $('#new_room_btn').click(function(){
      window.location = '/gameroom?room=' + $('#new_room_name').val();
  });
});