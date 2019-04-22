export function exportMapsModule(param){
	console.log("estoy aqui");
	// create a unique, global symbol name
	// -----------------------------------

	const ENTITY_KEY = Symbol.for("My.App.laberinto1.maps");

	// check if the global object has this symbol
	// add it if it does not have the symbol, yet
	// ------------------------------------------

	var globalSymbols = Object.getOwnPropertySymbols(window);
	var hasEntity = (globalSymbols.indexOf(ENTITY_KEY) > -1);

	if (!hasEntity){
	  window[ENTITY_KEY] = {
	    entity: "Maps"
	  };
	}

	var socket = window.socket;

	var Maps = function(param){
		
		var self = {};

		var Img = {};

		Img.map = {};
		Img.map['field'] = new Image();
		Img.map['field'].src = '/client/img/maps/1/map.png';
		Img.map['forest'] = new Image();
		Img.map['forest'].src = '/client/img/maps/2/map.png';

		self.Img = Img;

		self.changeMap = function(){
			socket.emit('changeMap');
		}
			
			
		self.drawMap = function(args){
			var player = args.selfPlayer;
			var x = WIDTH/2 - player.x;
			var y = HEIGHT/2 - player.y;
			ctx.drawImage(this.Img.map[player.map],x,y);
		}

		return self;
	};

	Object.defineProperty(Maps, "instance", {
	  get: function(){
	    return window[ENTITY_KEY];
	  }
	});

	// ensure the API is never changed
	// -------------------------------

	Object.freeze(Maps);

	// export the singleton API only
	// -----------------------------

	return Maps(param);
};
