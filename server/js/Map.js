// create a unique, global symbol name
// -----------------------------------

const MAP_KEY = Symbol.for("My.App.laberinto1.Map");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasBullet = (globalSymbols.indexOf(MAP_KEY) > -1);

if (!hasBullet){
  global[MAP_KEY] = {
    map: "Map"
  };
}

var Map = function(param){
	var self = this;
	self.metaData = param;
	
	self.initMap = function(){

	}

	self.cambioMapa = function(mapa){
		var panalesaMostrar = [];
		if (mapa === 'field'){
			panalesaMostrar.add('questionGame')
		}
		if (mapa === 'forest'){
		}
		return {
			paneles:panalesaMostrar
		};
	};
	
	return self;
}

Object.defineProperty(Evaluador, "instance", {
  get: function(){
    return global[EVALUADOR_KEY];
  }
});

// ensure the API is never changed
// -------------------------------

Object.freeze(Evaluador);

// export the singleton API only
// -----------------------------


module.exports = Evaluador;