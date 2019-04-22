var Entity = require(__dirname + '/Entity.js');

// create a unique, global symbol name
// -----------------------------------

const ROCK_KEY = Symbol.for("My.App.laberinto1.Rock");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasRock = (globalSymbols.indexOf(ROCK_KEY) > -1);

if (!hasRock){
  global[ROCK_KEY] = {
    rock: "Rock"
  };
}


const WIGHT = 20;
const HEIGHT = 20;


var Rock = function(param){
	if(!param.height)
		param.height = HEIGHT;	
	if(!param.weight)
		param.weight = WIGHT;
	var self = Entity(param);
	self.id = Math.random();
	self.type = "Rock";
	
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
	
	Rock.list[self.id] = self;
	return self;
}

Rock.list = {};


Object.defineProperty(Rock, "instance", {
  get: function(){
    return global[ROCK_KEY];
  }
});


// ensure the API is never changed
// -------------------------------

Object.freeze(Rock);

// export the singleton API only
// -----------------------------


module.exports = Rock;