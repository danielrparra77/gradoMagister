var Evaluador = require(__dirname + '/Evaluador.js');
var objEvaluador = Evaluador();

// create a unique, global symbol name
// -----------------------------------

const DISPAROS_KEY = Symbol.for("My.App.laberinto1.Disparos");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasEntity = (globalSymbols.indexOf(DISPAROS_KEY) > -1);

if (!hasEntity){
  global[DISPAROS_KEY] = {
    disparos: "Disparos"
  };
}



var Disparos = function(param){
	//console.log(param);
	var player =  param.player;
	var self = {
	};
	
	player.socket.on('keyPress',function(data){
		if(data.inputId === 'attack')
			player.pressingAttack = data.state;
	});

	//emitir nuevas preguntas a los clientes
	player.socket.emit('nuevaPregunta',objEvaluador.getPreguntaAleatoria());
	setInterval(function(){
		console.log(objEvaluador.getPreguntaAleatoria());
		player.socket.emit('nuevaPregunta',objEvaluador.getPreguntaAleatoria());
	},7000);
	
	player.socket.on('EnviarRespuesta',function(data){
		if(!global.DEBUG)
			return;
		player.actualizarScore(["disparos","preguntasContestadas"],1);
		var correto = objEvaluador.resolverPregunta(data.id,data.respuesta);
		console.log(correto);	
		if (correto){
			player.counterBullet+=5;
			player.actualizarScore(["disparos","preguntasAcertadas"],1);
		}
	});	

	return self;
};


Object.defineProperty(Disparos, "instance", {
  get: function(){
    return global[DISPAROS_KEY];
  }
});

// ensure the API is never changed
// -------------------------------

Object.freeze(Disparos);

// export the singleton API only
// -----------------------------

module.exports = Disparos;