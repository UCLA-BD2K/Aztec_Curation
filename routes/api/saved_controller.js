var Bookshelf = require('../../config/bookshelf.js');
var convert = require('../utilities/convert.js');
var SavedTool = require('../../models/mongo/savedTool.js');

var LIMIT_DEFAULT = 10;
var OFFSET_DEFAULT = 0;
module.exports = {
  searchByID: function(req, res, next){
    if(!req.isAuthenticated()){
      var response = {
        status  : 'error',
        error   : 'Not logged in'
      };
      return res.send(response);
    }
    else if(req.params['id']!=undefined && req.params['id'].length==24){
      var ObjectId = (require('mongoose').Types.ObjectId);
      var id = new ObjectId(req.params['id']);
      var user = req.user.attributes.EMAIL;
      SavedTool.findOne({user: user, '_id' : id}, function(err, tool){
        if (err || tool == null){
          var response = {
            status  : 'error',
            error   : 'Tool not found'
          };
          return res.send(response);
        }else{
          var sendTool = tool.toJSON();
          sendTool['tool']['savedID'] = id;
          return res.send(sendTool['tool']);
        }
      });
    }
    else{
      var response = {
        status  : 'error',
        error   : 'Invalid input'
      };
      return res.send(response);
    }
  },

  getAllTools: function(req, res){
    if(!req.isAuthenticated()){
      var response = {
        status  : 'error',
        error   : 'Not logged in'
      };
      return res.send(response);
    }
    else{
      var user = req.user.attributes.EMAIL;
      SavedTool.find({user : user}, function(err, tools){
        if (err || tools == null){
          var response = {
            status  : 'error',
            error   : 'Tools not found'
          };
          return res.send(response);
        }
        else{
          var sendTools = [];
          tools.forEach(function(tool){
            var toolJson = tool.toJSON();
            toolJson['tool']['basic']['id'] = toolJson['_id'];
            toolJson['tool']['basic']['date'] = toolJson['date'];
            sendTools.push(toolJson['tool']['basic']);
          });
          return res.send(sendTools);
        }
      });
    }

  }
};
