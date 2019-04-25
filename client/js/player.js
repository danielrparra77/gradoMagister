export function exportPlayersModule(param){
	// create a unique, global symbol name
	// -----------------------------------

	const ENTITY_KEY = Symbol.for("My.App.laberinto1.player");

	// check if the global object has this symbol
	// add it if it does not have the symbol, yet
	// ------------------------------------------

	var globalSymbols = Object.getOwnPropertySymbols(window);
	var hasEntity = (globalSymbols.indexOf(ENTITY_KEY) > -1);

	if (!hasEntity){
	  window[ENTITY_KEY] = {
	    entity: "Player"
	  };
	}

	var socket = window.socket;

	var Player = function(initPack){
		var self = {};
		self.id = initPack.id;
		self.number = initPack.number;
		self.x = initPack.x;
		self.y = initPack.y;
		self.hp = initPack.hp;
		self.hpMax = initPack.hpMax;
		self.score = initPack.score;
		self.map = initPack.map;
		self.aimAngle = 0;
		self.sprite3AnimCounter = 0;
		self.width = initPack.width;
		self.height = initPack.height;
		self.spriteAnimCounter = 0;
		self.moving = false;
		self.direccionmoving = 3;	//draw right

		Img.player = new Image();
		Img.player.src = '/client/img/player.png';
		
		self.draw = function(){	
			if(Player.list[selfId].map !== self.map)
				return;
			ctx.save();
			
			var width = self.width;
			var height = self.height;

			var x = self.x - Player.list[selfId].x + WIDTH/2 - width/2;
			var y = self.y - Player.list[selfId].y + HEIGHT/2 - height/2;
			
			var hpWidth = 30 * self.hp / self.hpMax;
			ctx.fillStyle = 'red';
			ctx.fillRect(x,y,hpWidth,4);
			
			

			var frameWidth = Img.player.width/3;
			var frameHeight = Img.player.height/4;

			var directionMod = self.direccionmoving;
			if (!self.moving){
				var aimAngle = self.aimAngle;
				if(aimAngle < 0)
					aimAngle = 360 + aimAngle;
				if(aimAngle >= 45 && aimAngle < 135)	//down
					directionMod = 2;
				else if(aimAngle >= 135 && aimAngle < 225)	//left
					directionMod = 1;
				else if(aimAngle >= 225 && aimAngle < 315)	//up
					directionMod = 0;
			}
			var walkingMod = Math.floor(self.spriteAnimCounter) % 3;//1,2	
			ctx.drawImage(Img.player,
				walkingMod*frameWidth,directionMod*frameHeight,frameWidth,frameHeight,
				x,y,width,height
			);
			
			ctx.restore();
			//ctx.drawImage(Img.player,
			//	0,0,Img.player.width,Img.player.height,
			//	x-width/2,y-height/2,width,height);
			
			//ctx.fillText(self.score,self.x,self.y-60);
		}
		
		Player.list[self.id] = self;	
		return self;
	}
	
	Player.list = {};

	Object.defineProperty(Player, "instance", {
	  get: function(){
	    return window[ENTITY_KEY];
	  }
	});

	// ensure the API is never changed
	// -------------------------------

	Object.freeze(Player);

	// export the singleton API only
	// -----------------------------

	return Player;
};
