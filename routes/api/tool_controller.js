var Bookshelf = require('../../config/bookshelf.js');
var async = require('async');
var convert = require('../utilities/convert.js');
var Tool = require('../../models/mysql/tool.js');
var ToolMisc = require('../../models/mongo/toolMisc.js');
var db = require('../utilities/db.js');

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


    if(params['name']==undefined){
      return getAllTools(res, limit, offset, limExist, offExist);
    }else{
      var term = params['name'];
      return queryDB(res, term, limit, offset, limExist, offExist);
    }
  },
  searchByID: function(req, res, next){
    if(req.params['id']!=undefined && !isNaN(req.params['id'])){
      return db.searchToolByID(req.params['id'], function(result){
        res.send(result);
      });
    }
    var response = {
      status  : 'error',
      error   : 'Invalid input'
    };
    return res.send(response);
  }
};

function getAllTools(res, lim, off, limExist, offExist){
  Tool.forge()
    .query(function (qb) {
      if(offExist){
        qb.offset(off);
      }
      if(limExist){
        qb.limit(lim);
      }
      qb.orderBy('AZID');
    })
    .fetchAll({withRelated: ['links', 'domains', 'agency', 'funding', 'license', 'platform', 'version', 'map', 'tags', 'resource_types', 'languages', 'institutions']})
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
