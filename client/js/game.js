	var WIDTH = 500;
	var HEIGHT = 500;
	window.socket = io();
	var socket = window.socket;
	var self = this;

	import('/client/js/map.js').then(module => {
		self.maps = module.exportMapsModule({});
		console.log("importado");
	});

	function changeMap(){
		return this.maps.changeMap();
	}
		
	//game
	var Img = {};
	Img.player = new Image();
	Img.player.src = '/client/img/player.png';
	Img.bullet = new Image();
	Img.bullet.src = '/client/img/bullet.png';
	
	var ctx = document.getElementById("ctx").getContext("2d");
	var ctxUi = document.getElementById("ctx-ui").getContext("2d");
	ctxUi.font = '30px Arial';
	
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

		
	var Bullet = function(initPack){
		var self = {};
		self.id = initPack.id;
		self.x = initPack.x;
		self.y = initPack.y;
		self.map = initPack.map;
		
		self.draw = function(){
			if(Player.list[selfId].map !== self.map)
				return;
			var width = Img.bullet.width/2;
			var height = Img.bullet.height/2;
			
			var x = self.x - Player.list[selfId].x + WIDTH/2;
			var y = self.y - Player.list[selfId].y + HEIGHT/2;
			
			ctx.drawImage(Img.bullet,
				0,0,Img.bullet.width,Img.bullet.height,
				x-width/2,y-height/2,width,height);
		}
		
		Bullet.list[self.id] = self;		
		return self;
	}
	Bullet.list = {};
	
	var selfId = null;

	socket.on('init',function(data){	
		if(data.selfId)
			selfId = data.selfId;
		//{ player : [{id:123,number:'1',x:0,y:0},{id:1,number:'2',x:0,y:0}], bullet: []}
		for(var i = 0 ; i < data.player.length; i++){
			new Player(data.player[i]);
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			new Bullet(data.bullet[i]);
		}
	});
	
	socket.on('update',function(data){
		//{ player : [{id:123,x:0,y:0},{id:1,x:0,y:0}], bullet: []}
		console.log('updating from server');
		for(var i = 0 ; i < data.player.length; i++){
			var pack = data.player[i];
			var p = Player.list[pack.id];
			if(p){
				if(pack.x !== undefined)
					p.x = pack.x;
				if(pack.y !== undefined)
					p.y = pack.y;
				if(p.moving && (pack.x !== undefined || pack.y !== undefined))
					p.spriteAnimCounter += 0.2;
				if(pack.hp !== undefined)
					p.hp = pack.hp;
				if(pack.score !== undefined)
					p.score = pack.score;
				if(pack.map !== undefined)
					p.map = pack.map;
			}
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			var pack = data.bullet[i];
			var b = Bullet.list[data.bullet[i].id];
			if(b){
				if(pack.x !== undefined)
					b.x = pack.x;
				if(pack.y !== undefined)
					b.y = pack.y;
			}
		}
	});
	
	socket.on('remove',function(data){
		//{player:[12323],bullet:[12323,123123]}
		for(var i = 0 ; i < data.player.length; i++){
			delete Player.list[data.player[i]];
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			delete Bullet.list[data.bullet[i]];
		}
	});


	var questionDescription = document.getElementById('question-description');
	var questionRespuesta = document.getElementById('question-respuesta');
	var pregunta = {};

	socket.on('nuevaPregunta',function(data){
		pregunta=data;
		console.log(pregunta);
		while (questionDescription.firstChild)
		    questionDescription.removeChild(questionDescription.firstChild);
		questionDescription.innerHTML += '<div>' + data.pregunta + '</div>';
		while (questionRespuesta.firstChild)
		    questionRespuesta.removeChild(questionRespuesta.firstChild);
		if (data.tipo=="multiple")
			for (var i = 0 ; i < data.posiblesrespuestas.length; i++)
				questionDescription.innerHTML += '<input type="radio" name="respuesta" value="' + data.posiblesrespuestas[i] + '">' + data.posiblesrespuestas[i] + '<br>';
		else if	(data.tipo=="abierta")
				questionDescription.innerHTML += '<input type="text" name="respuesta"></input>'
	});

	//UI
	var EnviarRespuesta = function(){
		if (pregunta.tipo=="abierta")
			socket.emit('EnviarRespuesta',{respuesta:document.getElementsByName("respuesta")[0].value,id:pregunta.id});
		else if (pregunta.tipo=="multiple") {
			var rates = document.getElementsByName('respuesta');
			var rate_value;
			for(var i = 0; i < rates.length; i++)
			    if(rates[i].checked)
			        rate_value = rates[i].value;
			socket.emit('EnviarRespuesta',{respuesta:rate_value,id:pregunta.id});
		}
	}
	


	
	setInterval(function(){
		if(!selfId)
			return;
		ctx.clearRect(0,0,500,500);
		self.maps.drawMap({
			selfPlayer:Player.list[selfId]
		});
		drawScore();
		for(var i in Player.list)
			Player.list[i].draw();
		for(var i in Bullet.list)
			Bullet.list[i].draw();
	},40);
	
	var drawScore = function(){
		if(lastScore === Player.list[selfId].score)
			return;
		lastScore = Player.list[selfId].score;
		ctxUi.clearRect(0,0,500,500);
		ctxUi.fillStyle = 'white';
		ctxUi.fillText(Player.list[selfId].score,0,30);
	}
	var lastScore = null;
	
	document.onkeydown = function(event){
		var p = Player.list[selfId];
		if(p)
			p.moving = true;
		if(event.keyCode === 68){	//d
			p.direccionmoving = 3;
			socket.emit('keyPress',{inputId:'right',state:true});
		}
		else if(event.keyCode === 83){	//s
			p.direccionmoving = 2;
			socket.emit('keyPress',{inputId:'down',state:true});
		}
		else if(event.keyCode === 65){ //a
			p.direccionmoving = 1;
			socket.emit('keyPress',{inputId:'left',state:true});
		}
		else if(event.keyCode === 87){ // w
			p.direccionmoving = 0;
			socket.emit('keyPress',{inputId:'up',state:true});
		}
			
	}
	document.onkeyup = function(event){
		var p = Player.list[selfId];
		if(p)
			p.moving = false;
		if(event.keyCode === 68){	//d
			p.direccionmoving = 3;
			socket.emit('keyPress',{inputId:'right',state:false});
		}
		else if(event.keyCode === 83){	//s
			p.direccionmoving = 2;
			socket.emit('keyPress',{inputId:'down',state:false});
		}
		else if(event.keyCode === 65){ //a
			p.direccionmoving = 1;
			socket.emit('keyPress',{inputId:'left',state:false});
		}
		else if(event.keyCode === 87){ // w
			p.direccionmoving = 0;
			socket.emit('keyPress',{inputId:'up',state:false});
		}
	}
	
	document.onmousedown = function(event){
		socket.emit('keyPress',{inputId:'attack',state:true});
	}
	document.onmouseup = function(event){
		socket.emit('keyPress',{inputId:'attack',state:false});
	}
	document.onmousemove = function(event){
		var x = -250 + event.clientX - 8;
		var y = -250 + event.clientY - 8;
		var angle = Math.atan2(y,x) / Math.PI * 180;
		socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
		var player = Player.list[selfId];
		player.aimAngle = angle;


	}
	
	document.oncontextmenu = function(event){
		event.preventDefault();
	}