$(function(){
	$('#startgame').dblclick(function(){
		document.cookie = "nickname=" + $('#nickname').val() + ";; path=/";
     	window.location = "/rooms";
   	});
});