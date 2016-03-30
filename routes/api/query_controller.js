var Bookshelf = require('../../config/bookshelf.js');
var async = require('async');
var Set = require('collections/set');

var LIMIT_DEFAULT = 10;
var OFFSET_DEFAULT = 0;
module.exports = function(Model, Alias){
  var module = {};
  module.search = function(req, res, next) {
    var params = req.query;
    var limit = LIMIT_DEFAULT;
    var offset = OFFSET_DEFAULT;
    var offExist = false;
    var limExist = false;

    if(params['limit']!=undefined){
      limit = parseInt(params['limit']);
      limExist = true;
    }
    if(params['offset']!=undefined){
      offset = parseInt(params['offset']);
      offExist = true;
    }

    if(params['q']==undefined){
      return getAll(res, limit, offset, limExist, offExist);
    }else{
      var term = params['q'];
      if(Alias!=undefined || Alias!=null)
        return queryAlias(res, term, limit, offset, limExist, offExist);
      else {
        return queryDB(res, term, limit, offset, limExist, offExist);
      }
    }
  };

  function getAll(res, lim, off, limExist, offExist){
    Model.forge()
      .query(function (qb) {
        if(offExist){
          qb.offset(off);
        }
        if(limExist){
          qb.limit(lim);
        }
        qb.orderBy('NAME');
      })
      .fetchAll()
      .then(function(i){
        return res.send(i);
      })
      .catch(function(err){
        var response = {
          status  : 'error',
          error   : JSON.stringify(err)
        }
        return res.send(response);
      });
  };

  function queryAlias(res, term, lim, off, limExist, offExist){
    Alias.forge()
      .query(function (qb) {
        if(limExist){
          qb.limit(lim);
        }
        if(offExist){
          qb.offset(off);
        }

        qb.groupBy('PRIMARY_NAME');
        qb.column('PRIMARY_NAME', 'ALIAS');
      })
      .where('ALIAS', 'LIKE', term+'%')
      .fetchAll()
      .then(function(a){
        return res.send(a);
      })
      .catch(function(err){
        var response = {
          status  : 'error',
          error   : JSON.stringify(err)
        }
        return res.send(response);
      });
  };

  function queryDB(res, term, lim, off, limExist, offExist){
    Model.forge()
      .query(function (qb) {
        if(limExist){
          qb.limit(lim);
        }
        if(offExist){
          qb.offset(off);
        }

        qb.column('NAME');
      })
      .where('NAME', 'LIKE', term+'%')
      .fetchAll()
      .then(function(tag){
        return res.send(tag);
      })
      .catch(function(err){
        var response = {
          status  : 'error',
          error   : JSON.stringify(err)
        }
        return res.send(response);
      });
  };

  return module;
};
