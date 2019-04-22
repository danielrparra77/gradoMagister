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
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
		map:'forest',
		type:"",
		height:0,
		weight:0
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.map)
			self.map = param.map;
		if(param.id)
			self.id = param.id;
		if(param.height)
			self.height = param.height;	
		if(param.weight)
			self.weight = param.weight;			
	}
	
	self.update = function(){
		collide = false;
		if (self.weight+self.x+self.spdX>660 || self.height+self.y+self.spdY>500 || self.x+self.spdX<0 || self.y+self.spdY<0){
			collide = true;
		}	
		for(var i in Entity.list){
			var entity = Entity.list[i];
			if (entity.map == self.map)
				if (entity.type !="Bullet" && self.type !="Bullet" &&  entity.id !=self.id)	{
					if ((intersection(range(self.weight,self.x+self.spdX),range(entity.weight,entity.x)).length>0) && 
						(intersection(range(self.height,self.y+self.spdY),range(entity.height,entity.y)).length>0)){
						collide = true;
						break;
					}	
				}
		}
		if (!collide)
			self.updatePosition();
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