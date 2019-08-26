var Entity = require(__dirname + '/Entity.js');

// create a unique, global symbol name
// -----------------------------------

const BULLET_KEY = Symbol.for("My.App.laberinto1.Bullet");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasBullet = (globalSymbols.indexOf(BULLET_KEY) > -1);

if (!hasBullet){
  global[BULLET_KEY] = {
    bullet: "Bullet"
  };
}


const WIGHT = 20;
const HEIGHT = 20;


var Bullet = function(param){
	if(!param.height)
		param.height = HEIGHT;	
	if(!param.weight)
		param.weight = WIGHT;
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;
	self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
	self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
	self.parent = param.parent;
	self.type = "Bullet";
	
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();
		PlayerList = global.PlayerList;
		for(var i in PlayerList){
			var p = PlayerList[i];
			if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){
				p.hp -= 1;
								
				if(p.hp <= 0){
					var shooter = PlayerList[self.parent];
					if(shooter){
						shooter.actualizarScore(["disparos","juegosGanados"],1);
					}
					p.hp = p.hpMax;
					p.x = Math.random() * 500;
					p.y = Math.random() * 500;					
				}
				self.toRemove = true;
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,		
		};
	}
	
	Bullet.list[self.id] = self;
	global.initPack.bullet.push(self.getInitPack());
	return self;
}

Bullet.list = {};


Object.defineProperty(Bullet, "instance", {
  get: function(){
    return global[BULLET_KEY];
  }
});


Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			global.removePack.bullet.push(bullet.id);
		} else
			pack.push(bullet.getUpdatePack());		
	}
	return pack;
}

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}


// ensure the API is never changed
// -------------------------------

Object.freeze(Bullet);

// export the singleton API only
// -----------------------------


module.exports = Bullet;