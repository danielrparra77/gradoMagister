	var Gself = {};

	import('/client/js/Solid.js').then(module => {
		Gself.solid = module.exportSolidModule({});
		console.log("importado solid");
	});

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
			
			var self = Gself;
			var Img = window.Img;
			Img.map = {};
			/*Img.map = {
				forest:{
					src:'/client/img/maps/1/map.png',
					staticObjects:[
						{
							src:'/client/img/maps/1/rock.png',
							Spritex:680,
							Spritey:620,
							SpriteWidth:120,
							Spriteheight:120,
							width:20,
							height:20,
							x:0,
							y:0,
							type:'rock'
						}
					]
				},
				field:{
					src:'/client/img/maps/2/map.png',
					staticObjects:[
						{
							src:'/client/img/maps/2/rock.png',
							Spritex:680,
							Spritey:250,
							SpriteWidth:120,
							Spriteheight:120,
							width:20,
							height:20,
							x:0,
							y:0,
							type:'rock'
						}
					]
				}
			};*/

			self.staticObjects ={};

			Img.map = extractJSONforImage(Img.map, '');

			self.Img = Img.map;

			self.changeMap = function(){
				socket.emit('changeMap');
			}

			self.setMetaMap = function(metaMap){
				metaMap = extractJSONforImage(metaMap, '');
				Img.map = metaMap;
				self.Img = metaMap;
			}
				
				
			self.drawMap = function(args){
				var player = args.selfPlayer;
				var map = player.map;
				if (!(self.staticObjects.hasOwnProperty(map)))
					self.initStaticObjects(player);
				if (map == 'field')
					$("#questionGame").show();
				else
					$("#questionGame").hide();
				var x = window.WIDTH/2 - player.x;
				var y = window.HEIGHT/2 - player.y;
				window.ctx.drawImage(this.Img[map].img,x,y);
				for (const i in self.staticObjects[map])
					self.staticObjects[map][i].draw(player.x,player.y);
			}

			self.getSolid = function(map,idSolid){
				return self.staticObjects[map][idSolid];
			}

			self.initStaticObjects = function(player){
				var elements = {};
				var it = 0;
				var map = player.map;
				for (const i in self.Img[map].staticObjects) {
					var params = self.Img[map].staticObjects[i];
					params.map = map;
					params.player = player;
					for (const j in self.Img[map].position[params.type]){
						let id = self.Img[map].position[params.type][j].id;
						params.id = id;
						params.x = self.Img[map].position[params.type][j].x;
						params.y = self.Img[map].position[params.type][j].y;
						params.traspasable = self.Img[map].position[params.type][j].traspasable;
						params.visible = self.Img[map].position[params.type][j].visible;
						elements[id] = self.solid(params);
					}
					it +=1;
				}
				self.staticObjects[map]=elements;
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

	function extractJSONforImage(obj, indent) {
		for (const i in obj) {
			if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
				//console.log(indent + i + ' is array or object');
				if (!(indent.includes("img")))
					extractJSONforImage(obj[i], indent + ' > ' + i + ' > ');
				if( obj[i].hasOwnProperty('src') && !(obj[i].hasOwnProperty('img'))){
					obj[i].img = new Image();
					obj[i].img.src = obj[i].src;
				}
			} else {
				//console.log(indent + i + ': ' + obj[i]);
			}
		}
		return obj;
	}