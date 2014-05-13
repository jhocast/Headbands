var BSON = require('mongodb').BSONPure,
	tableName = 'things';	
		
exports.list = function(db){
  	console.log("Going over things.list");
	return function(req, res){
		console.log('Request', req);
		console.log('response', res);
		console.log("Just requested", req.originalUrl)
		if (req.originalUrl === undefined) {
			room = "No Room"
		} else {
			room = req.originalUrl.indexOf("?") > 0 ? req.originalUrl.split("=").pop() : req.cookies.RoomName;
		}
		var colThings = db.get(tableName), colUsers = db.get('users'),
			thisUser = req.cookies.nickname;
		//first we are going to add the user record
		colUsers.find({ "CurrentGame.Name" : room },{}, function(e,usrs){
			console.log('cookies', req.cookies);
			console.log('cookies.name',req.cookies.nickname);
			var record = {
				"username": req.cookies.nickname,
				"sessionId": req.cookies['session.sid'],
				"userstate": 'Joined Game',
				"userpoints": 0,
				"wins" : 0,
				"LastLoggedIn" : new Date(),
				"CurrentGame" : { Name: room, Points: 0, Wins: 0, GameOrder: usrs.length +1 }
			}
			colUsers.insert(record, function(err, doc) {
				if(err){
					res.send("There was error inserting record into database");
				} else {
					console.log("Successfully entered record\n", record);
					colThings.find({},{}, function(e, thing){
						colUsers.find({ "CurrentGame.Name" : room },{}, function(e,usrs){
							console.log('req', req.cookies);
							maxRecs = thing.length;
							var x = 6,
								curRecord = usrs.length + 1,
								currentPlayers = { };
							while (x > 0) {
								currentPlayers[x] = {
									Name : 'None', Points : 0, GameId : room, 
									Identity : 'Unknown',
									GameStatus: 'Initialized'
								} 
								x--;
							}
							//loading values already in database
							console.log('usrs', usrs);
							//var recs = 1;
							for (rec in usrs) {
								var gameRec = usrs[rec].CurrentGame;
							    currentPlayers[usrs[rec].CurrentGame.GameOrder] = {
									Name : usrs[rec].username
								}
							}
							console.log(currentPlayers)
							res.render('gameroom', { "players": currentPlayers, "user" : req.cookies.nickname});
						});
					});
				}
			});
		});
	};
};



				
				
				