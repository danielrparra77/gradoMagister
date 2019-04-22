// create a unique, global symbol name
// -----------------------------------

const EVALUADOR_KEY = Symbol.for("My.App.laberinto1.Evaluador");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasBullet = (globalSymbols.indexOf(EVALUADOR_KEY) > -1);

if (!hasBullet){
  global[EVALUADOR_KEY] = {
    evaluador: "Evaluador"
  };
}


const WIGHT = 20;
const HEIGHT = 20;


var Evaluador = function(param){
	var self = this;
	self.setPreguntas = [];
	
	self.initQuestionsSources = function(){
		self.setPreguntas =  [{
			id:1,
			pregunta:"¿Las bases de datos Documentales usan XML?",
			respuesta:"si",
			tipo:"multiple",
			posiblesrespuestas:["si","no"]
		},{
			id:2,
			pregunta:"¿ChouchDB es una base de datos documental?",
			respuesta:"si",
			tipo:"multiple",
			posiblesrespuestas:["si","no"]
		},{
			id:3,
			pregunta:"En un JSON que contiene el elemento estudiantes que es una lista, escria el comando para consultar a aquellos cuyo 'sexo' es 'hombre'",
			respuesta:"db.estudiantes.find({sexo:'hombre'}).pretty()",
			tipo:"abierta",
		},		
		];
		return self.setPreguntas;
	}

	self.getPreguntaAleatoria = function(){
		var x = Math.floor(Math.random() * self.setPreguntas.length);
		return self.setPreguntas[x];
	}

	self.resolverPregunta = function(id, respuesta){
		var pregunta = self.setPreguntas.filter(x => x.id === id)[0];
		if (pregunta.tipo == "multiple" || pregunta.tipo == "abierta")
			return respuesta == pregunta.respuesta;
		return false;
	}

	self.initQuestionsSources();
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