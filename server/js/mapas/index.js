
var Solid = require('../Solid.js');
var Ghost = require('../Ghost.js');
var LaberintoParejas = require('../../escenarios/escenario2/LaberintoParejas.js');

class mapas {

    constructor (MongoConnector) {
        var self = this;
        MongoConnector.findOneData('metaMapas',{},function(data){
            self.metaMap = data;
            console.log("iniciando MetaMapa");
            self.initSolids();
            self.laberintoParejas = LaberintoParejas({
                ghosts:Ghost.list,
                ghostDeclaration:Ghost
            })
        });
    }

    initSolids (){
        for (const i in this.metaMap.maps){
            var map = this.metaMap.maps[i];
            var jmap = this.metaMap[map];
            for (const j in jmap.staticObjects){
                var object = jmap.staticObjects[j];
                var positions = jmap.position[object.type];
                var it = 0;
                for (const k in positions){
                    var id = map+object.type+it.toString();
                    var param = {
                        x:positions[k].x+20,
                        y:positions[k].y+20,
                        id:id,
                        type:object.type,
                        map:map,
                        traspasable:false,
                        visible:true
                    };
                    this.metaMap[map].position[object.type][k].id = id;
                    this.metaMap[map].position[object.type][k].traspasable = param.traspasable;
                    this.metaMap[map].position[object.type][k].visible = param.visible;
                    if (object.type==="ghost"){
                        param.traspasable = true;
                        var ghost = Ghost(param);
                    }
                    else
                        var solid = Solid(param);
                    it+=1;
                }
            }
        }
    }

    cambioMapa (mapa){
        var panalesaMostrar = [];
        if (this.mapa === 'field'){
            panalesaMostrar= ['questionGame'];
        }
        if (this.mapa === 'forest'){
        }
        return {
            paneles:panalesaMostrar
        };
    };

  
    getMetamap (){
        return this.metaMap;
    }
  
    getLaberintoParejas () {
        return this.laberintoParejas;
    }
}


module.exports.mapas = (function(MongoConnector) {
    'use strict';
    return new mapas(MongoConnector);
});
