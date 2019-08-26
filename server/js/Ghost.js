var Solid = require(__dirname + '/Solid.js');

// create a unique, global symbol name
// -----------------------------------

const GHOST_KEY = Symbol.for("My.App.laberinto1.Ghost");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasGhost = (globalSymbols.indexOf(GHOST_KEY) > -1);

if (!hasGhost){
  global[GHOST_KEY] = {
    ghost: "Ghost"
  };
}


const WIGHT = 20;
const HEIGHT = 20;


var Ghost = function(param){
	if (param){

	}
	var self = Solid(param);
	self.type = param.type;
	
	var super_update = self.update;
	self.update = function(){
		super_update();
	}
	var super_getInitPack = self.getInitPack;
	self.getInitPack = function(){
		return super_getInitPack();
	}
	var super_getUpdatePack = self.getUpdatePack;
	self.getUpdatePack = function(){
		return super_getUpdatePack();
	}
	var super_setTraspasable = self.setTraspasable;
	self.setTraspasable = function(){
		return super_setTraspasable();
	}
	self.getGhost = function(){
		return self;
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			visible:self.visible
		}	
	}
	
	Ghost.list[self.id] = self;
	return self;
}

Ghost.list = {};


Object.defineProperty(Ghost, "instance", {
  get: function(){
    return global[GHOST_KEY];
  }
});


// ensure the API is never changed
// -------------------------------

Object.freeze(Ghost);

// export the singleton API only
// -----------------------------


module.exports = Ghost;