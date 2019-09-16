var Entity = require(__dirname + '/Entity.js');
var Bullet = require(__dirname + '/Bullet.js');
const WIGHT = 30;
const HEIGHT = 40;
const MAXSHOOTS = 1;

var Player = function(param){
	if(!param.height)
		param.height = HEIGHT;	
	if(!param.weight)
		param.weight = WIGHT;
	var self = Entity(param);
	self.username = param.username;
	self.name = param.name;
	self.date = param.date;
	self.gender = param.gender;
	self.isNew = param.isNew;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;
	self.hpMax = 10;
	self.hp = 10;
	self.con = param.con;
	self.score = {
		disparos:{
			juegosJugados:0,
			juegosGanados:0,
			preguntasContestadas:0,
			preguntasAcertadas:0
		},
		laberinto:{
			juegosJugados:0,
			juegosGanados:0,
			preguntasContestadas:0,
			preguntasAcertadas:0
		}
	};
	if(typeof param.score !== "undefined"){
		self.score = param.score;
	}
	if(typeof param.hp !== "undefined"){
		self.hp = param.hp;
	}
	self.counterBullet = 5;
	self.maxShoots = MAXSHOOTS;
	self.type = "Player";
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		
		super_update();
		
		if(self.pressingAttack && self.counterBullet > 0 && self.maxShoots > 0){
			self.shootBullet(self.mouseAngle);
			self.counterBullet -=1;
			self.maxShoots -=1;
		}
		if (self.maxShoots <= 0){
			self.pressingAttack = false;
			self.maxShoots = MAXSHOOTS;
		}
	}
	self.shootBullet = function(angle){
		Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
		});
	}

	var super_onDiscconect = self.onDisconnect;
	self.onDisconnect = function(socket){
		delete Player.list[self.id];
		super_onDiscconect(socket);
		global.removePack.player.push(socket.id);
	}
	
	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;		
	}
	
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,	
			number:self.number,	
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			map:self.map,
			width:WIGHT,
			height:HEIGHT
		};		
	}
	self.getUpdatePack = function(){
		let data = {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			map:self.map,
			username:self.username,
			name:self.name,
			date:self.date,
			gender:self.gender
		};
		if (self.isNew == true){
			data.pass = self.pass;
		}
		return data;
	}

	self.savePlayerProgress = function (con,callback){
		console.log("para guardar los datos de este player");
		//con.insertOneData("users",self.getUpdatePack(),res=>{
		con.upsertOneData("users",{username:self.username},self.getUpdatePack(),res=>{
			console.log("Data insertada");
			self.isNew = false;
			callback(res);
		});
	}

	self.updateScore = function (scoreLink,counter,response){
		if (scoreLink.length == 0)
			return response+=counter;
		let link = scoreLink[0];
		scoreLink.shift();
		response[link]=self.updateScore(scoreLink,counter,response[link]);
		return response;
	}

	self.actualizarScore = function(scoreLink,counter){
		self.score = self.updateScore(scoreLink,counter,self.score);
		let scores = {};
		let usernameSingedIn = [];
		for (let pl in Player.list){
			let itplayer = Player.list[pl];
			let score = itplayer.score;
			for (var prop in score) {
				if (score.hasOwnProperty(prop)) {
					if (scores[prop]==null)
						scores[prop] = [];
					score[prop].username = itplayer.username;
					scores[prop].push(score[prop]);
				}
			}
			usernameSingedIn.push(itplayer.username);
		}
		self.con.findAllData("users",{username:{ $nin: usernameSingedIn }},{ projection:{username:1,score:1,_id:0}},res=>{
			for (let index in res){
				let score = res[index].score;
				for (var prop in score) {
					if (score.hasOwnProperty(prop)) {
						if (scores[prop]==null)
							scores[prop] = [];
						score[prop].username = res[index].username;
						scores[prop].push(score[prop]);
					}
				}
			}
			self.socket.emit("updateScore",scores);
		});
		self.savePlayerProgress(self.con,res=>{

		});
	}
	
	Player.list[self.id] = self;

	self.onMapChanged = function(){	
		if (self.map =="field")
			self.actualizarScore(["disparos","juegosGanados"],0);
		if (self.map =="forest")
			self.actualizarScore(["laberinto","juegosGanados"],0);
	}
	self.onMapChanged();
	global.initPack.player.push(self.getInitPack());
	if (param.isNew == true){
		self.pass = param.pass;
		self.savePlayerProgress(param.con,param.callback);
	}
	return self;
}

Player.list = {};

Player.findUser = function(con,params,callback){
	con.findOneData("users",params,res=>{
		console.log(res);
		callback(res);
	});
}

global.PlayerList = Player.list;

module.exports = Player;