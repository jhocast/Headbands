exports.index = function(req, res){
	res.render('index', { title: 'Headbands' });
};

exports.rooms = function(req, res){
	console.log("rendering rooms---------------------------------");
	res.render('rooms', { title: 'Game Room List'});
};

exports.gameroom = function(req, res){
	console.log("rendering game room---------------------------------");
	res.render('gameroom', { title: 'Gameroom' });
};