// create a unique, global symbol name
// -----------------------------------

const EVALUADOR_KEY = Symbol.for("My.App.laberinto1.EvaluadorParejas");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasBullet = (globalSymbols.indexOf(EVALUADOR_KEY) > -1);

if (!hasBullet){
  global[EVALUADOR_KEY] = {
    EvaluadorParejas: "EvaluadorParejas"
  };
}


const WIGHT = 20;
const HEIGHT = 20;


var EvaluadorParejas = function(param){
	var self = this;
	self.setPreguntasParejas = [];
	
	self.initQuestionsSourcesParejas = function(){
		self.setPreguntasParejas =  [{
			id:1,
			pregunta:"Es una base de datos que se basa en artefactos independientes y de formato definido",
			respuesta:5,
			tipo:"pareja"
		},{
			id:2,
			pregunta:"Es una base de datos qiue piensa en rendimiento por escalabilidad horizontal",
			respuesta:6,
			tipo:"pareja"
		},{
			id:3,
			pregunta:"Base de datos que relaciona cualquier concepto con claves para dar relaciones simples'",
			respuesta:7,
			tipo:"pareja"
		},{
			id:4,
			pregunta:"Base de datos utilizada para analisisde relaciones encadenadas de un nodo",
			respuesta:8,
			tipo:"pareja"
		},{
			id:5,
			pregunta:"NOSQL documentales",
			respuesta:1,
			tipo:"pareja"
		},{
			id:6,
			pregunta:"NOSQL Orientado a columnas",
			respuesta:2,
			tipo:"pareja"
		},{
			id:7,
			pregunta:"NOSQL orientado a clave valor",
			respuesta:3,
			tipo:"pareja"
		},{
			id:8,
			pregunta:"NOSQL orientado a grafos",
			respuesta:4,
			tipo:"pareja"
		}		
		];
		self.preguntasSinAsignar = JSON.parse(JSON.stringify(self.setPreguntasParejas));;
		return self.setPreguntasParejas;
	}

	self.getPreguntaAleatoriaParejas = function(preguntasYaDadas){
	    var x = 1;
		//do {
			var x = Math.floor(Math.random() * self.preguntasSinAsignar.length);
		//}
		//while (preguntasYaDadas.indexOf(x) > -1);
		var pregunta = self.preguntasSinAsignar[x];
		self.preguntasSinAsignar.splice(x,1);
		pregunta.escenario = 'laberintoParejas';
		return pregunta;
	}
	/*een este caso la respeusta debe ser el ID de la pareja*/
	self.resolverPreguntaParejas = function(id, respuesta){
		//console.log(self.setPreguntasParejas);
		var pregunta = self.setPreguntasParejas.filter(x => x.id === id)[0];
		if (pregunta.tipo === "pareja")
			return respuesta === pregunta.respuesta;
		return false;
	}

	self.initQuestionsSourcesParejas();
	return self;
}

Object.defineProperty(EvaluadorParejas, "instance", {
  get: function(){
    return global[EVALUADOR_KEY];
  }
});

// ensure the API is never changed
// -------------------------------

Object.freeze(EvaluadorParejas);

// export the singleton API only
// -----------------------------


module.exports = EvaluadorParejas;