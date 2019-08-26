// create a unique, global symbol name
// -----------------------------------

const MONGOCONNECTOR_KEY = Symbol.for("My.App.laberinto1.MongoConnector");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var hasSolid = (globalSymbols.indexOf(MONGOCONNECTOR_KEY) > -1);
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

if (!hasSolid){
  global[MONGOCONNECTOR_KEY] = {
    mongoConnector: "MongoConnector"
  };
}

var MongoConnector = function(param){
	var self = {};

	self.connect = function(callback){

		// Connection URL
		const url = 'mongodb://localhost:27017';

		// Database Name
		const dbName = 'aprendizajeMaestro';

		// Create a new MongoClient
		const client = new MongoClient(url);

		// Use connect method to connect to the Server
		client.connect(function(err) {
		  	assert.equal(null, err);
		  	console.log("Connected successfully to server");

		  	const db = client.db(dbName);
		  	console.log('bien con la base de datos');
		  	callback({
		  		client: client,
		  		db:db
		  	});
		});

	}
	self.disconnect = function(connector){
		connector.client.close();
	}
	self.findOneData = function(collectionName,query,callback){
		// Get the documents collection
		self.connect(function(connector){
			const db = connector.db;
	  		const collection = db.collection(collectionName);
	  		collection.findOne(query, function(err, docs) {
				if (err) throw err;
				console.log("Found the the record");
				callback(docs);
				self.disconnect(connector);
			});
		});
	};
	self.insertOneData = function(collectionName,object,callback){
		self.connect(function(connector){
			const db = connector.db;
	  		const collection = db.collection(collectionName);
			collection.insertOne(object, function(err, res) {
			  if (err) throw err;
			  console.log("1 document inserted");
			  callback(res);
			  self.disconnect(connector);
			});
		});
	}
	self.upsertOneData = function (collectionName,key,object,callback){
		self.connect(function(connector){
			const db = connector.db;
	  		const collection = db.collection(collectionName);
			collection.findOneAndUpdate(key,
				{ $set: object },
				{upsert: true, 'new': true},
				function(err, res) {
					if (err) throw err;
					console.log("1 document updated");
					callback(res);
					self.disconnect(connector);
				}
			);
		});
	}
	return self;
}

Object.defineProperty(MongoConnector, "instance", {
  get: function(){
    return global[MONGOCONNECTOR_KEY];
  }
});


// ensure the API is never changed
// -------------------------------

Object.freeze(MongoConnector);

// export the singleton API only
// -----------------------------


module.exports = MongoConnector;