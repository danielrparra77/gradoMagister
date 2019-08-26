var Entity = require(__dirname + '/Entity.js');

// create a unique, global symbol name
// -----------------------------------

const ROCK_KEY = Symbol.for("My.App.laberinto1.Solid");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasSolid = (globalSymbols.indexOf(ROCK_KEY) > -1);

if (!hasSolid){
  global[ROCK_KEY] = {
    solid: "Solid"
  };
}


const WIGHT = 20;
const HEIGHT = 20;


var Solid = function(param){
	if (param){
		if(typeof param.height === "undefined")
			param.height = HEIGHT;	
		if(typeof param.weight === "undefined")
			param.weight = WIGHT;
		if(typeof param.type === "undefined")
			param.type = "Solid";
		if(typeof param.id === "undefined")
			param.id = Math.random();
	}
	var self = Entity(param);
	self.type = param.type;
	
	var super_update = self.update;
	self.update = function(){
		super_update();
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
	self.setTraspasable = function(traspasable){
		self.traspasable = traspasable;
	}
	self.getSolid = function(){
		return self;
	}
	
	Solid.list[self.id] = self;
	return self;
}

Solid.list = {};


Object.defineProperty(Solid, "instance", {
  get: function(){
    return global[ROCK_KEY];
  }
});


// ensure the API is never changed
// -------------------------------

Object.freeze(Solid);

// export the singleton API only
// -----------------------------


module.exports = Solid;