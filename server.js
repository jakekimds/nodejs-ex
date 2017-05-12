var mongo = require("mongodb").MongoClient;
var client = require("socket.io").listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat', function(error,db){
	if(error) throw error;


	client.on('connection', function(socket){

		var col = db.collection("messages");
		var sendStatus = function(s){
			socket.emit("status", s);
		}

		col.find().limit(100).sort({"_id": 1}).toArray(function(err, res){
			if(err) throw err;
			socket.emit("output", res);
		});

		socket.on('input', function(data){
			var name = data.name;
			var message = data.message;
			var whiteSpacePattern = /^\s*$/;

			if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message)){
				sendStatus("Name and message is required");
			}else{
				col.insert({"name":name,"message":message}, function(){
					
					client.emit("output", [data]);

					sendStatus({
						message: "Message sent",
						clear: true
					});

				});
			}

		});
	});
});