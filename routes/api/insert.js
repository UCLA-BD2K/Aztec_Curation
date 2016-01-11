var Bookshelf = require('../../config/bookshelf.js');
var async = require('async');
var Institution = require('../../models/mysql/institution.js');
var Alias = require('../../models/mysql/inst_alias.js');
var Set = require('collections/set');

module.exports = {
  insertInst: function(req, res, next) {
    var json = require('../../misc/database/university_aliases.json');
    var result = [];

    var UNIVERSITY_OF_THE = "UNIVERSITY OF THE ";
    var UNIVERSITY_OF = "UNIVERSITY OF ";

    var AliasObj = function(inst_id, primary, alias){
      this.INST_ID = inst_id;
      this.PRIMARY_NAME = primary;
      this.ALIAS = alias;
    };


    // var obj = json[1];
    json.forEach(function(obj){
      var name = obj['name'].toUpperCase();
      var inst = {NAME: name};
      async.waterfall([
        function(cb){
          Institution.forge()
            .save(inst)
            .then(function(i){
              console.log("saved "+name+"!");
              return cb(null, i);
            })
            .catch(function(err){
              console.log("error "+name+"!");
              console.log("skipping");
              return cb(name);
            });
        },
        function(newInst, cb){

          var aliasSet = new Set(null, function(a, b){
            return a.ALIAS==b.ALIAS;
          }, function(object){
            return object.ALIAS;
          });

          var alias =  new AliasObj(newInst.attributes.INST_ID, newInst.attributes.NAME, newInst.attributes.NAME);
          console.log(JSON.stringify(alias));
          aliasSet.add(alias);

          if(name.startsWith(UNIVERSITY_OF_THE)){
            var newAlias =  new AliasObj(newInst.attributes.INST_ID, newInst.attributes.NAME, newInst.attributes.NAME.substring(UNIVERSITY_OF_THE.length));
            aliasSet.add(newAlias);
          }else if(name.startsWith(UNIVERSITY_OF)){
            var newAlias =  new AliasObj(newInst.attributes.INST_ID, newInst.attributes.NAME, newInst.attributes.NAME.substring(UNIVERSITY_OF.length));
            aliasSet.add(newAlias);
          }

          obj['aliases'].forEach(function(element){
            var aliasName = element.toUpperCase();
            if(aliasName.startsWith(UNIVERSITY_OF_THE)){
              var newAlias =  new AliasObj(newInst.attributes.INST_ID, newInst.attributes.NAME, aliasName.substring(UNIVERSITY_OF_THE.length));
              aliasSet.add(newAlias);
            }else if(aliasName.startsWith(UNIVERSITY_OF)){
              var newAlias =  new AliasObj(newInst.attributes.INST_ID, newInst.attributes.NAME, aliasName.substring(UNIVERSITY_OF.length));
              aliasSet.add(newAlias);
            }
            var newAlias =  new AliasObj(newInst.attributes.INST_ID, newInst.attributes.NAME, aliasName);
            aliasSet.add(newAlias);
          });

          var arr = aliasSet.toArray();
          console.log(JSON.stringify(arr));
          arr.forEach(function(element){
            Alias.forge()
              .save(element)
              .then(function(i){
                console.log("saved alias "+i.attributes.ALIAS+"!");
              })
              .catch(function(err){
                console.log("error alias "+element.ALIAS+"!", err);
                console.log("skipping");
              });
          });
          return cb(null);
        }],
        function(error){
          if(error!=null)
            console.log('Async error', error);
        }
      );

    });

    res.send(result);

  }
}
