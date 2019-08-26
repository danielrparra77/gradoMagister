// create a unique, global symbol name
// -----------------------------------

const ENTITY_KEY = Symbol.for("My.App.laberinto1.Entity");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasEntity = (globalSymbols.indexOf(ENTITY_KEY) > -1);

if (!hasEntity){
  global[ENTITY_KEY] = {
    entity: "Entity"
  };
}



var Entity = function(param){
	//console.log(param);
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
		map:'forest',
		type:"",
		height:0,
		weight:0,
		traspasable: false,
		visible:true
	}
	if(param){
		if(typeof param.x !== "undefined"){
			self.x = param.x;
		}
		if(typeof param.y !== "undefined")
			self.y = param.y;
		if(typeof param.map !== "undefined")
			self.map = param.map;
		if(typeof param.id !== "undefined")
			self.id = param.id;
		if(typeof param.height !== "undefined")
			self.height = param.height;	
		if(typeof param.weight !== "undefined")
			self.weight = param.weight;		
		if(typeof param.type !== "undefined")
			self.type = param.type;		
		if(typeof param.traspasable !== "undefined")
			self.traspasable = param.traspasable;	
		if(typeof param.visible !== "undefined")
			self.visible = param.visible;			
	}
	//console.log(self);

	self.update = function(){
		collide = false;
		touch = false;//collide pero sensible incluso con elementos fantasmas
		if (self.weight+self.x+self.spdX>660 || self.height+self.y+self.spdY>500 || self.x+self.spdX<0 || self.y+self.spdY<0){
			collide = true;
			touch = true;
		}
		for(var i in Entity.list){
			var entity = Entity.list[i];
			if (entity.map == self.map)
				if (/* && self.type !="Bullet" &&*/  entity.id !=self.id && entity.visible && self.visible)	{
					//console.log(self.weight+" "+self.x+self.spdX+" "+entity.weight+" "+entity.x);
					//console.log(self.heigh+" "+self.y+self.spdY+" "+entity.height+" "+entity.y);
					if ((intersection(range(self.weight,self.x+self.spdX),range(entity.weight,entity.x)).length>0) && 
						(intersection(range(self.height,self.y+self.spdY),range(entity.height,entity.y)).length>0)){
						touch = true;
						if (entity.traspasable ===false)
							collide = true;
						self.onlementsCollide(self, entity);
						entity.onlementsCollide(self, entity);
						break;
					}	
				}
		}
		self.onCollide = touch;
		if (self.onCollide && !self.onCollideIn)
			self.onCollideIn = true;
		if (self.onCollide && self.onCollideIn)
			self.onCollideIn = false;
		if (self.onCollide)
			self.onCollideOut = false;
		if (!self.onCollide && !self.onCollideOut)
			self.onCollideOut = true;
		if (!collide)
			self.updatePosition();
	}

	self.getEntity = function(){
		return self;
	}

	self.onlementsCollide = function(entity1, entity2){
		return {
			entity1:entity1,
			entity2:entity2
		};
	}

	self.onDisconnect = function(socket){
		delete Entity.list[self.id];
	}

	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}

	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}

	Entity.list[self.id] = self;

	return self;
};

var intersection = function(){
  return Array.from(arguments).reduce(function(previous, current){
    return previous.filter(function(element){
      return current.indexOf(element) > -1;
    });
  });
};

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
};

Entity.list = {};


Object.defineProperty(Entity, "instance", {
  get: function(){
    return global[ENTITY_KEY];
  }
});

// ensure the API is never changed
// -------------------------------

Object.freeze(Entity);

// export the singleton API only
// -----------------------------

module.exports = Entity;