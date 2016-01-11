var Bookshelf = require('../../config/bookshelf.js');
var async = require('async');
var Institution = require('../../models/mysql/institution.js');
var Alias = require('../../models/mysql/inst_alias.js');
var Set = require('collections/set');

var LIMIT_DEFAULT = 10;
var OFFSET_DEFAULT = 0;
module.exports = {
  search: function(req, res, next) {
    var params = req.query;
    var limit = LIMIT_DEFAULT;
    var offset = OFFSET_DEFAULT;
    var offExist = false;
    var limExist = false;

    if(params['limit']!=undefined){
      limit = parseInt(params['limit']);
      console.log(limit);
      limExist = true;
    }
    if(params['offset']!=undefined){
      offset = parseInt(params['offset']);
      offExist = true;
    }

    if(params['q']==undefined){
      console.log(offExist);
      return getAllInst(res, limit, offset, limExist, offExist);
    }else{
      var term = params['q'];
      return queryDB(res, term, limit, offset, limExist, offExist);
    }
  }
};

function getAllInst(res, lim, off, limExist, offExist){
  Institution.forge()
    .query(function (qb) {
      if(offExist){
        console.log('off');
        qb.offset(off);
      }
      if(limExist){
        qb.limit(lim);
      }
      qb.orderBy('INST_ID');
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

function queryDB(res, term, lim, off, limExist, offExist){
  Alias.forge()
    .query(function (qb) {
      if(limExist){
        qb.limit(lim);
      }
      if(offExist){
        qb.offset(off);
      }

      qb.groupBy('INST_ID');
      qb.column('PRIMARY_NAME', 'ALIAS', 'INST_ID');
    })
    .where('ALIAS', 'LIKE', term+'%')
    .fetchAll()
    .then(function(inst){
      return res.send(inst);
    })
    .catch(function(err){
      var response = {
        status  : 'error',
        error   : JSON.stringify(err)
      }
      return res.send(response);
    });
};
