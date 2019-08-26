export function exportBulletModule(param){
	// create a unique, global symbol name
	// -----------------------------------

	const ENTITY_KEY = Symbol.for("My.App.laberinto1.bullet");

	// check if the global object has this symbol
	// add it if it does not have the symbol, yet
	// ------------------------------------------

	var globalSymbols = Object.getOwnPropertySymbols(window);
	var hasEntity = (globalSymbols.indexOf(ENTITY_KEY) > -1);

	if (!hasEntity){
	  window[ENTITY_KEY] = {
	    entity: "Bullet"
	  };
	}

	var socket = window.socket;

	var Bullet = function(initPack){
		var self = {};
		self.id = initPack.id;
		self.x = initPack.x;
		self.y = initPack.y;
		self.map = initPack.map;
		self.Player = initPack.Player;
		var Img = window.Img;
		
		self.draw = function(){
			if(self.Player.map !== self.map)
				return;
			var width = Img.bullet.width/2;
			var height = Img.bullet.height/2;
			
			var x = self.x - self.Player.x + window.WIDTH/2;
			var y = self.y - self.Player.y + window.HEIGHT/2;
			
			window.ctx.drawImage(Img.bullet,
				0,0,Img.bullet.width,Img.bullet.height,
				x-width/2,y-height/2,width,height);
		}
		
		Bullet.list[self.id] = self;		
		return self;
	}
	Bullet.list = {};

	Object.defineProperty(Bullet, "instance", {
	  get: function(){
	    return window[ENTITY_KEY];
	  }
	});

	// ensure the API is never changed
	// -------------------------------

	Object.freeze(Bullet);

	// export the singleton API only
	// -----------------------------

	return Bullet;
};
