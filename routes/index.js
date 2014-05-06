
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.chatroom = function(req, res){
	console.log("rendering chat room---------------------------------");
	res.render('chatroom', { title: 'Express Chat' });
}

exports.rooms = function(req, res){
	console.log("rendering rooms---------------------------------");
	res.render('rooms', { title: 'Game Room List' });
}

exports.gameroom = function(req, res){
	console.log("rendering game room---------------------------------");
	res.render('gameroom', { title: 'Gameroom' });
}