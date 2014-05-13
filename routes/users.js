var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/projectTwo');
var things = require('./things');

var BSON = require('mongodb').BSONPure,
	tableName = 'users';

exports.list = function(req, res){
	return function(req, res){
		var colUsers = db.get(tableName),
			colThings = db.get('things');
		colUsers.find({},{}, function(e, user) {
			colThings.find({}, {}, function(e, thing) {
				res.render('users', { "users": user, "thingslist": thing });
			});
		});
	};
};

exports.add = function(db){
	console.log("Adding a user");
	return function(req, res){
		console.log(req.cookies);
		var collection =db.get(tableName),
			record = {
				"username": req.cookies.nickname,
				"sessionId": req.cookies['express.sid'],
				"userstate": 'Joined Game',
				"userpoints": 0,
				"wins" : 0,
				"LastLoggedIn" : new Date(),
				"CurrentGame" : { 
					Name: req.cookies.RoomName, Points: 0, Wins: 0, GameOrder: 1
				}
			}
		collection.insert(record, function(err, doc) {
			if(err){
				res.send("There was error inserting record into database");
			} else {
				console.log("Successfully entered record\n", record);
			}
		});
	}		
}

