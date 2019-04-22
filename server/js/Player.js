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
	console.log(param.height+" "+param.weight);	
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.username = param.username;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;
	self.hp = 10;
	self.hpMax = 10;
	self.score = 0;
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
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			map:self.map,
		}	
	}
	
	Player.list[self.id] = self;
	
	global.initPack.player.push(self.getInitPack());
	return self;
}

Player.list = {};

global.PlayerList = Player.list;

module.exports = Player;