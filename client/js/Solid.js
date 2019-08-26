export function exportSolidModule(param){
	// create a unique, global symbol name
	// -----------------------------------

	const ENTITY_KEY = Symbol.for("My.App.laberinto1.solid");

	// check if the global object has this symbol
	// add it if it does not have the symbol, yet
	// ------------------------------------------

	var globalSymbols = Object.getOwnPropertySymbols(window);
	var hasEntity = (globalSymbols.indexOf(ENTITY_KEY) > -1);

	if (!hasEntity){
	  window[ENTITY_KEY] = {
	    entity: "Solid"
	  };
	}

	var socket = window.socket;

	var Solid = function(initPack){
		var self = {};
		self.id = initPack.id;
		self.x = initPack.x;
		self.y = initPack.y;
		self.map = initPack.map;
		self.Player = initPack.player;
		self.width = initPack.width;
		self.Spritex = initPack.Spritex;
		self.Spritey = initPack.Spritey;
		self.SpriteWidth = initPack.SpriteWidth;
		self.Spriteheight = initPack.Spriteheight;
		self.height = initPack.height;
		self.img = initPack.img;
		self.visible = initPack.visible;
		self.traspasable = initPack.traspasable;
		
		self.draw = function(playerx,playery){
			if(self.Player.map !== self.map)
				return;
			var width = self.img.width/2;
			var height = self.img.height/2;

			var x = self.x - playerx + window.WIDTH/2;
			var y = self.y - playery + window.HEIGHT/2;
			if(!self.visible){
				x=0; y=0;
			}
			
			window.ctx.drawImage(self.img,
				self.Spritex,self.Spritey,self.SpriteWidth,self.Spriteheight,
				x,y,self.width,self.height);
		}

		self.setVisible = function (visible, playerx, playery) {
			self.visible = visible;
			self.draw(playerx,playery);
		}
		
		Solid.list[self.id] = self;		
		return self;
	}
	Solid.list = {};

	Object.defineProperty(Solid, "instance", {
	  get: function(){
	    return window[ENTITY_KEY];
	  }
	});

	// ensure the API is never changed
	// -------------------------------

	Object.freeze(Solid);

	// export the singleton API only
	// -----------------------------

	return Solid;
};
