	var WIDTH = 500;
	var HEIGHT = 500;
	window.socket = io();
	var socket = window.socket;
	var self = this;
	
	import('/client/js/map.js').then(module => {
		self.maps = module.exportMapsModule({});
		console.log("importado");
	});

	import('/client/js/player.js').then(module => {
		self.Player = module.exportPlayersModule();
		console.log("importado player");
	});
	
	import('/client/js/Bullet.js').then(module => {
		self.Bullet = module.exportBulletModule();
		console.log("importado bullet");
	});
	
	function changeMap(){
		return this.maps.changeMap();
	}
		
	//game
	var Img = {};
	Img.bullet = new Image();
	Img.bullet.src = '/client/img/bullet.png';
	
	var ctxUI = document.getElementById("ctx");
	var ctx = ctxUI.getContext("2d");
	var ctxUi = document.getElementById("ctx-ui").getContext("2d");
	ctxUi.font = '30px Arial';
	
	var selfId = null;

	socket.on('init',function(data){	
		if(data.selfId)
			selfId = data.selfId;
		//{ player : [{id:123,number:'1',x:0,y:0},{id:1,number:'2',x:0,y:0}], bullet: []}
		for(var i = 0 ; i < data.player.length; i++){
			new self.Player(data.player[i]);
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			new self.Bullet(getDataBullet(data.bullet[i]));
		}
	});
	
	socket.on('update',function(data){
		//{ player : [{id:123,x:0,y:0},{id:1,x:0,y:0}], bullet: []}
		console.log('updating from server');
		for(var i = 0 ; i < data.player.length; i++){
			var pack = data.player[i];
			var p = self.Player.list[pack.id];
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
			var b = self.Bullet.list[data.bullet[i].id];
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
			delete self.Player.list[data.player[i]];
		}
		for(var i = 0 ; i < data.bullet.length; i++){
			delete self.Bullet.list[getDataBullet(data.bullet[i])];
		}
	});
	
	function getDataBullet(data){
		data.Player = self.Player.list[selfId];
		return data;
	}


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
			selfPlayer:self.Player.list[selfId]
		});
		drawScore();
		for(var i in self.Player.list)
			self.Player.list[i].draw();
		for(var i in Bullet.list)
			self.Bullet.list[i].draw();
	},40);
	
	var drawScore = function(){
		if(lastScore === self.Player.list[selfId].score)
			return;
		lastScore = self.Player.list[selfId].score;
		ctxUi.clearRect(0,0,500,500);
		ctxUi.fillStyle = 'white';
		ctxUi.fillText(self.Player.list[selfId].score,0,30);
	}
	var lastScore = null;
	
	document.onkeydown = function(event){
		var p = self.Player.list[selfId];
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
		var p = self.Player.list[selfId];
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
		if (selfId !== null){
			var x = -500 + event.clientX - 8;
			var y = -500 + event.clientY - 8;
			console.log(ctxUI.getBoundingClientRect().top+" "+ctxUI.getBoundingClientRect().left);
			var angle = 180*Math.atan2(y
				, x)/Math.PI;
			socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
			var player = self.Player.list[selfId];
			player.aimAngle = angle;
		}

	}
	
	document.oncontextmenu = function(event){
		event.preventDefault();
	}