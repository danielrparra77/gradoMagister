//var mongojs = require("mongojs");
var db = null;//mongojs('localhost:27017/myGame', ['account','progress']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});
global.io = io;
var Bullet = require(__dirname + '/server/js/Bullet.js');
global.Player = require(__dirname + '/server/js/Player.js');
var MongoConnector = require(__dirname + '/server/js/MongoConnector.js');
var Disparos = require(__dirname + '/server/escenarios/escenario1/Disparos.js');
var mapas = require(__dirname+'/server/js/mapas');
MongoConnector = MongoConnector();
mapas = mapas.mapas(MongoConnector);

global.initPack = {player:[],bullet:[]};
global.removePack = {player:[],bullet:[]}; 


app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var SOCKET_LIST = {};

global.Player.onConnect = function(socket,data){
	let map;
	if (typeof data.map == "undefined"){
		map = 'forest';
		if(Math.random() < 0.5)
			map = 'field';
	}
	else
		map = data.map;
	socket.emit('panelEscenarios',mapas.cambioMapa(map));
	data.id = socket.id;
	data.map = map;
	var player = Player(data);
	player.socket = socket;
	player.Disparos = Disparos({
		player:player
	});

	player.LaberintoParejas = mapas.getLaberintoParejas();
	socket.on("guardarCambios",function(data){
		player.savePlayerProgress(MongoConnector,res=>{
			console.log("guardado");
		});
	});
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if( data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
	
	socket.on('changeMap',function(data){
		if(player.map === 'field')
			player.map = 'forest';
		else
			player.map = 'field';
		socket.emit('panelEscenarios',mapas.cambioMapa(player.map));
	});
	
	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});
	socket.on('sendPmToServer',function(data){ //data:{username,message}
		var recipientSocket = null;
		for(var i in global.Player.list)
			if(global.Player.list[i].username === data.username)
				recipientSocket = SOCKET_LIST[i];
		if(recipientSocket === null){
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		} else {
			recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
			socket.emit('addToChat','To ' + data.username + ':' + data.message);
		}
	});
	
	/*para despues de haber iniciado*/
	socket.emit('init',{
		selfId:socket.id,
		username:data.username,
		player:global.Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack()
	});
}
global.Player.getAllInitPack = function(){
	var players = [];
	for(var i in global.Player.list)
		players.push(global.Player.list[i].getInitPack());
	return players;
}

/*Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	global.removePack.player.push(socket.id);
}*/
global.Player.update = function(){
	var pack = [];
	for(var i in global.Player.list){
		var player = global.Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());		
	}
	return pack;
}

global.DEBUG = true;

var isValidPassword = function(data,cb){
	global.Player.findUser(MongoConnector,{username:data.username, pass: data.password},function(res){
		if(res !== null)
			cb(true,res);
		else
			cb(false,res);
	});
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
		isValidPassword(data,function(res,player){
			if(res){
				global.Player.onConnect(socket,player);
				socket.emit('signInResponse',{success:true});
			} else {
				socket.emit('signInResponse',{success:false});			
			}
		});
	});
	socket.on('signUp',function(data){
		if (data.username.length <=0){
			socket.emit('signUpResponse',{success:false});
		}
		else{
			global.Player.findUser(MongoConnector,{username:data.username},function(res){
				if(res !== null){
					socket.emit('signUpResponse',{success:false});		
				} else {
					data.isNew = true;
					data.con = MongoConnector;
					data.callback = function (res){
						if (res.ok === 1)
							socket.emit('signUpResponse',{success:true});
					}
					global.Player.onConnect(socket,data);
				}
			});	
		}	
	});
	
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		//global.Player.onDisconnect(socket);
		console.log(global.Player.list);
		if (global.Player.list.length === 0)
			return;
		if (typeof global.Player.list[socket.id] == 'undefined')
			return;
		global.Player.list[socket.id].onDisconnect(socket);
	});
	
	socket.on('evalServer',function(data){
		if(!global.DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});	
});


setInterval(function(){
	var pack = {
		player:global.Player.update(),
		bullet:Bullet.update(),
	}
	io.sockets.emit('updateScenary',pack);
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',global.initPack);
		socket.emit('update',pack);
		socket.emit('remove',global.removePack);
		/*apenas el cliente entro a la plataforma*/
		socket.emit('construct',{
			metaMap:mapas.getMetamap()
		});
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