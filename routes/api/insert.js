var logger = require("../../config/logger");
var Bookshelf = require('../../config/bookshelf.js');
var async = require('async');
var Institution = require('../../models/mysql/institution.js');
var InstAlias = require('../../models/mysql/inst_alias.js');
var Language = require('../../models/mysql/language.js');
var LangAlias = require('../../models/mysql/lang_alias.js');
var Agency = require('../../models/mysql/agency.js');
var AgencyAlias = require('../../models/mysql/agency_alias.js');
var Set = require('collections/set');

module.exports = {
  insertInst: function(req, res, next) {
    var json = require('../../misc/database/institutions_aliases.json');
    var result = [];

    var UNIVERSITY_OF_THE = "UNIVERSITY OF THE ";
    var UNIVERSITY_OF = "UNIVERSITY OF ";

    var AliasObj = function(primary, alias){
      this.PRIMARY_NAME = primary;
      this.ALIAS = alias;
    };


    // var obj = json[1];
    json.forEach(function(obj){
      var name = obj['name'];
      var inst = {NAME: name};
      async.waterfall([
        function(cb){
          Institution.forge()
            .save(inst)
            .then(function(i){
              logger.debug("Saved institution %s!", name);
              return cb(null, i);
            })
            .catch(function(err){
              logger.debug("Error for institution %s!", name);
              return cb(name);
            });
        },
        function(newInst, cb){

          var aliasSet = new Set(null, function(a, b){
            return a.ALIAS==b.ALIAS;
          }, function(object){
            return object.ALIAS;
          });

          var alias =  new AliasObj(newInst.attributes.NAME, newInst.attributes.NAME);
          aliasSet.add(alias);

          if(name.toUpperCase().startsWith(UNIVERSITY_OF_THE)){
            var newAlias =  new AliasObj(newInst.attributes.NAME, newInst.attributes.NAME.substring(UNIVERSITY_OF_THE.length));
            aliasSet.add(newAlias);
          }else if(name.toUpperCase().startsWith(UNIVERSITY_OF)){
            var newAlias =  new AliasObj(newInst.attributes.NAME, newInst.attributes.NAME.substring(UNIVERSITY_OF.length));
            aliasSet.add(newAlias);
          }

          obj['aliases'].forEach(function(element){
            var aliasName = element;
            if(aliasName.toUpperCase().startsWith(UNIVERSITY_OF_THE)){
              var newAlias =  new AliasObj(newInst.attributes.NAME, aliasName.substring(UNIVERSITY_OF_THE.length));
              aliasSet.add(newAlias);
            }else if(aliasName.toUpperCase().startsWith(UNIVERSITY_OF)){
              var newAlias =  new AliasObj(newInst.attributes.NAME, aliasName.substring(UNIVERSITY_OF.length));
              aliasSet.add(newAlias);
            }
            var newAlias =  new AliasObj(newInst.attributes.NAME, aliasName);
            aliasSet.add(newAlias);
          });

          var arr = aliasSet.toArray();

          arr.forEach(function(element){
            InstAlias.forge()
              .save(element)
              .then(function(i){
                logger.debug("Saved alias %s!", i.attributes.ALIAS);
              })
              .catch(function(err){
                logger.debug("Error for alias %s!", element.ALIAS);
              });
          });
          return cb(null);
        }],
        function(error){
          if(error!=null)
            logger.debug("Async Error");
        }
      );

    });

    res.send(result);

  },
  insertLang: function(req, res, next) {
    var json = require('../../misc/database/languages_aliases.json');
    var result = [];


    var AliasObj = function(primary, alias){
      this.PRIMARY_NAME = primary;
      this.ALIAS = alias;
    };

    for(var key in json){

      var obj = json[key];
      async.waterfall([
        function(cb){
          Language.forge()
            .save({NAME: obj['name']})
            .then(function(lang){
              logger.debug("Saved language %s!", lang.attributes.NAME);
              return cb(null, lang);
            })
            .catch(function(err){
              logger.debug("Error for language %s!", obj['name']);
              return cb(obj);
            });
        },
        function(newLang, cb){
          var aliasSet = new Set(null, function(a, b){
            return a.ALIAS==b.ALIAS;
          }, function(object){
            return object.ALIAS;
          });

          var name = newLang.attributes.NAME;
          var alias =  new AliasObj(name, name);
          aliasSet.add(alias);

          var aliases = json[name]['aliases'];
          //return cb(null);
          if(aliases!=undefined){
            aliases.forEach(function(a){
              var newAlias =  new AliasObj(name, a);
              aliasSet.add(newAlias);
            })
          }
          var arr = aliasSet.toArray();
          //console.log(JSON.stringify(arr));
          arr.forEach(function(element){
            LangAlias.forge()
              .save(element)
              .then(function(i){
                //console.log("saved alias "+i.attributes.ALIAS+"!");
              })
              .catch(function(err){
                logger.debug("Error for alias %s!", element.ALIAS);
              });
          });
          cb(null);
        }
      ],
      function(error){
        if(error!=null)
          logger.debug("Async Error");
      }
    );

    }

    res.send('got it');

  },
  insertAgency: function(req, res, next){
    var json = require('../../misc/database/funding.json');
    var result = [];


    var AliasObj = function(primary, alias){
      this.PRIMARY_NAME = primary;
      this.ALIAS = alias;
    };

    // var obj = json[1];
    json.forEach(function(obj){
      var name = obj['name'];
      var country = obj['country'];
      var type = null;
      if(obj['type']!=undefined){
        if(obj['type']=='pri'){
          type = 'private';
        }
        else if(obj['type']=='gov'){
          type = 'government';
        }else{
          type = obj['type'];
        }
      }
      var subtype = null;
      if(obj['subtype']!=undefined){
        subtype = obj['subtype'];
      }
      var agency = {NAME: name, COUNTRY: country, TYPE: type, SUBTYPE: subtype};
      async.waterfall([
        function(cb){
          Agency.forge()
            .save(agency)
            .then(function(a){
              logger.debug("Saved agency %s!", name);
              return cb(null, a);
            })
            .catch(function(err){
              console.log(err);
              logger.debug("Error for agency %s!", name);
              return cb(name);
            });
        },
        function(newAgency, cb){

          var aliasSet = new Set(null, function(a, b){
            return a.ALIAS==b.ALIAS;
          }, function(object){
            return object.ALIAS;
          });

          var alias =  new AliasObj(newAgency.attributes.NAME, newAgency.attributes.NAME);
          aliasSet.add(alias);

          obj['aliases'].forEach(function(element){
            var newAlias =  new AliasObj(newAgency.attributes.NAME, element);
            aliasSet.add(newAlias);
          });

          var arr = aliasSet.toArray();

          arr.forEach(function(element){
            AgencyAlias.forge()
              .save(element)
              .then(function(a){
                logger.debug("Saved alias %s!", a.attributes.ALIAS);
              })
              .catch(function(err){
                console.log(err);
                logger.debug("Error for alias %s!", element.ALIAS);
              });
          });
          return cb(null);
        }],
        function(error){
          if(error!=null)
            logger.debug("Async Error");
        }
      );

    });

    res.send(result);

  }
}
