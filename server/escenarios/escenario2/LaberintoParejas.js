var EvaluadorParejas = require(__dirname + '/EvaluadorParejas.js');
var objEvaluadorParejas = EvaluadorParejas();

// create a unique, global symbol name
// -----------------------------------

const LABERINTOPAREJAS_KEY = Symbol.for("My.App.laberinto1.LaberintoParejas");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasEntity = (globalSymbols.indexOf(LABERINTOPAREJAS_KEY) > -1);

if (!hasEntity){
  global[LABERINTOPAREJAS_KEY] = {
    laberintoParejas: "LaberintoParejas"
  };
}



var LaberintoParejas = function(param){
	//console.log(param);
	//var Player =  param.player;
	var self = {
		ghostDeclaration:param.ghostDeclaration,
		ghosts:param.ghosts//todos los fantasmas creados en el laberinto
	};

	//emitir nuevas preguntas a los clientes
	/*self.socket.emit('nuevaPregunta',objEvaluador.getPreguntaAleatoria());
	setInterval(function(){
		self.socket.emit('nuevaPregunta',objEvaluador.getPreguntaAleatoria());
	},20000);
	*/

	self.emitirPregunta = function(player,fantasma){
		let pregunta = fantasma.preguntaAsignada;
		console.log(pregunta);
		if(typeof player.fantasmaSeleccionado === "undefined"){
			player.fantasmaSeleccionado = fantasma;
			player.socket.emit('nuevaPregunta',pregunta);
		}
		else{
			var respuestaCorrecta = objEvaluadorParejas.resolverPreguntaParejas(player.fantasmaSeleccionado.preguntaAsignada.id,pregunta.id);
			console.log(respuestaCorrecta);
			if (respuestaCorrecta){
				player.socket.emit('nuevaPregunta',{id:0,pregunta:'correcto',respuesta:2,tipo:'pareha',escenario:"laberintoParejas"});
				fantasma.visible = false;
				player.fantasmaSeleccionado.visible = false;
				io.sockets.emit('updateSolidVisible',{
					solids:[
						{
							id:fantasma.id,
							visible:fantasma.visible
						},
						{
							id:player.fantasmaSeleccionado.id,
							visible:player.fantasmaSeleccionado.visible
						}
					]
				});
			}
			else{
				player.fantasmaSeleccionado = fantasma;
				player.socket.emit('nuevaPregunta',pregunta);
			}
		}
	};

	var idsPregutnasAsignadas = [];
	objEvaluadorParejas.initQuestionsSourcesParejas();
	for(var ghost in self.ghosts){
		var ghost = self.ghostDeclaration.list[ghost];
		var preguntaNueva = objEvaluadorParejas.getPreguntaAleatoriaParejas(idsPregutnasAsignadas);
		idsPregutnasAsignadas.push(preguntaNueva.id);
		ghost.preguntaAsignada = preguntaNueva;
		(ghost.getGhost()).onlementsCollide = function(entity1, entity2){
			for(var player in global.Player.list){
				//console.log(global.Player);
				if (entity1.type==='ghost' && entity2.id == player)
					self.emitirPregunta(global.Player.list[player],entity1);
					//global.Player.list[player].socket.emit('nuevaPregunta',entity1.preguntaAsignada);
				if (entity2.type==='ghost' && entity1.id == player)
					self.emitirPregunta(global.Player.list[player],entity2);
					//global.Player.list[player].socket.emit('nuevaPregunta',entity2.preguntaAsignada);
			}
		}
	}
;	console.log(idsPregutnasAsignadas);
	/*
	player.socket.on('EnviarRespuestaPareja',function(data){
		if(!global.DEBUG)
			return;
		var correto = objEvaluador.resolverPregunta(data.id,data.respuesta);
		console.log(correto);	
		if (correto)
			player.counterBullet+=5;
	});	*/

	return self;
};


Object.defineProperty(LaberintoParejas, "instance", {
  get: function(){
    return global[LABERINTOPAREJAS_KEY];
  }
});

// ensure the API is never changed
// -------------------------------

Object.freeze(LaberintoParejas);

// export the singleton API only
// -----------------------------

module.exports = LaberintoParejas;