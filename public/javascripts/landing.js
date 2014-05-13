$(function(){
  console.log("going into landing.js");
  $('#startgame').dblclick(function(){
    document.cookie = "nickname=" + $('#nickname').val() + ";; path=/";
    window.location = "/rooms";
  });
});