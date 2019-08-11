var express = require('express');
var socket = require('socket.io');

var app = express();

var users = {};

var server = app.listen(process.env.PORT || 3000, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
app.use(express.static('public'));

var io = socket(server);
io.on('connection', (socket) => {
	socket.on('join', (name) => {
		users[socket.id] = name;
		socket.broadcast.emit('join', users[socket.id]);
	})

	socket.on('disconnect', () => {
		socket.broadcast.emit('logout', users[socket.id]);
		delete users[socket.id];
	})

	socket.on("send", (msg) => {
		socket.broadcast.emit("msg", users[socket.id], msg);
	});  
});