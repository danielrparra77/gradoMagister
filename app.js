//var mongojs = require("mongojs");
var db = null;//mongojs('localhost:27017/myGame', ['account','progress']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});
var Bullet = require(__dirname + '/server/js/Bullet.js');
var Player = require(__dirname + '/server/js/Player.js');
var Evaluador = require(__dirname + '/server/js/Evaluador.js');
var objEvaluador = Evaluador();

global.initPack = {player:[],bullet:[]};
global.removePack = {player:[],bullet:[]};


app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var SOCKET_LIST = {};

var metaMap = {
	forest:{
		objects: [{
			id:'rock',
			widthParts:2,
			heigthParts:2,
			width:20,
			height:20
		}],
		width:500,
		height:500,
		position:{
			rock:[
			{
				width:0,
				height:20,
			},{
				width:0,
				height:40,
			}
			]
		}
	},
	field:{
		objects: [],
		width:500,
		height:500,
		position:{}
	},
}

Player.onConnect = function(socket,username){
	var map = 'forest';
	if(Math.random() < 0.5)
		map = 'field';
	var player = Player({
		username:username,
		id:socket.id,
		map:map,
	});
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
	
	socket.on('changeMap',function(data){
		if(player.map === 'field')
			player.map = 'forest';
		else
			player.map = 'field';
	});
	
	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});
	socket.on('sendPmToServer',function(data){ //data:{username,message}
		var recipientSocket = null;
		for(var i in Player.list)
			if(Player.list[i].username === data.username)
				recipientSocket = SOCKET_LIST[i];
		if(recipientSocket === null){
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		} else {
			recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
			socket.emit('addToChat','To ' + data.username + ':' + data.message);
		}
	});
	
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})

	//emitir nuevas preguntas a los clientes
	socket.emit('nuevaPregunta',objEvaluador.getPreguntaAleatoria());
	setInterval(function(){
		socket.emit('nuevaPregunta',objEvaluador.getPreguntaAleatoria());
	},20000);
	
	socket.on('EnviarRespuesta',function(data){
		if(!DEBUG)
			return;
		var correto = objEvaluador.resolverPregunta(data.id,data.respuesta);
		console.log(correto);	
		if (correto)
			player.counterBullet+=5;
	});	
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	global.removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());		
	}
	return pack;
}

var DEBUG = true;

var isValidPassword = function(data,cb){
	return cb(true);
	/*db.account.find({username:data.username,password:data.password},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});*/
}
var isUsernameTaken = function(data,cb){
	return cb(false);
	/*db.account.find({username:data.username},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});*/
}
var addUser = function(data,cb){
	return cb();
	/*db.account.insert({username:data.username,password:data.password},function(err){
		cb();
	});*/
}

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn',function(data){ //{username,password}
		isValidPassword(data,function(res){
			if(res){
				Player.onConnect(socket,data.username);
				socket.emit('signInResponse',{success:true});
			} else {
				socket.emit('signInResponse',{success:false});			
			}
		});
	});
	socket.on('signUp',function(data){
		isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse',{success:false});		
			} else {
				addUser(data,function(){
					socket.emit('signUpResponse',{success:true});					
				});
			}
		});		
	});
	
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});	
});


setInterval(function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',global.initPack);
		socket.emit('update',pack);
		socket.emit('remove',global.removePack);
	}
	global.initPack.player = [];
	global.initPack.bullet = [];
	global.removePack.player = [];
	global.removePack.bullet = [];
	
},1000/25);


/*
var profiler = require('v8-profiler');
var fs = require('fs');
var startProfiling = function(duration){
	profiler.startProfiling('1', true);
	setTimeout(function(){
		var profile1 = profiler.stopProfiling('1');
		
		profile1.export(function(error, result) {
			fs.writeFile('./profile.cpuprofile', result);
			profile1.delete();
			console.log("Profile saved.");
		});
	},duration);	
}
startProfiling(10000);
*/