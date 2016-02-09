var Bookshelf = require('../../config/bookshelf.js');
var async = require('async');
var Tag = require('../../models/mysql/tag.js');


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
      limExist = true;
    }
    if(params['offset']!=undefined){
      offset = parseInt(params['offset']);
      offExist = true;
    }

    if(params['q']==undefined){
      return getAllTags(res, limit, offset, limExist, offExist);
    }else{
      var term = params['q'];
      return queryDB(res, term, limit, offset, limExist, offExist);
    }
  }
};

function getAllTags(res, lim, off, limExist, offExist){
  Tag.forge()
    .query(function (qb) {
      if(offExist){
        qb.offset(off);
      }
      if(limExist){
        qb.limit(lim);
      }
      qb.orderBy('TAG_ID');
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
  Tag.forge()
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
