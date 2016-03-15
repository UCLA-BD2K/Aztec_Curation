var passport = require('passport');
var logger = require("../config/logger");
var util = require('../utility/generalUtil.js');
var User  = require('../models/mysql/user.js');
var Tool  = require('../models/mysql/tool.js');
var SavedTool  = require('../models/mongo/savedTool.js');


function UserController(){
  var self = this;

  this.home = function(req, res){ self._home(self, req, res); };
  this.register = function(req, res){ self._register(self, req, res); };
  this.edit = function(req, res){self._edit(self, req, res); };
  this.getSaved = function(req, res){self._getSaved(self, req, res); };
  this.getSavedAPI = function(req, res){self._getSavedAPI(self, req, res); };
  this.getAllSaved = function(req, res){self._getAllSaved(self, req, res); };

}

UserController.prototype._home = function(self, req, res){
  var loginName = 'Login';
  if(req.isAuthenticated())
    loginName = req.user.attributes.FIRST_NAME;
  User.forge()
    .query({where: {USER_ID: req.user.attributes.USER_ID}})
    .fetch({withRelated: ['tools']})
    .then(function(user){
      if(user==null){
        return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: null, saved: null});
      }
      else{
        logger.info('Found existing user: %s', user.attributes.FIRST_NAME);
        logger.debug(user.tools());
        var email = req.user.attributes.EMAIL;
        SavedTool.find({user : email}, function(err, tools){
          if (err || tools == null){
            return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: null, saved: null});
          }
          else{
            var savedTools = [];
            tools.forEach(function(tool){
              var toolJson = tool.toJSON();
              toolJson['tool']['id'] = toolJson['_id'];
              toolJson['tool']['date'] = toolJson['date'];
              savedTools.push(toolJson['tool']);
            });
            return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: user, saved: savedTools});
          }
        });

      }
    })
    .catch(function(err){
      logger.info('query user error');
      logger.debug(err);
      return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: null, saved: null});
    })
};

UserController.prototype._register = function(self, req, res){
  var loginName = 'Login';
  if(req.isAuthenticated())
    loginName = req.user.attributes.FIRST_NAME;
  else {
    return util.showStatus(req, res, 'error', 'Not logged in');
  }

  res.render('form.ejs', {title:"Register", heading:"Register New Resource", name: loginName, loggedIn : req.isAuthenticated(), editURL: ".", submitFunc: "onNewSubmit()", tool: null, init: ""});

};

UserController.prototype._edit = function(self, req, res){
  var id = req.params.id;
  id = parseInt(id);
  if(!req.isAuthenticated()){
    return util.showStatus(req, res, 'error', 'Not logged in');
  }
  var userID = req.user.attributes.USER_ID;
  logger.info("User %s is accessing resource #%s", userID, id);
  Tool.forge()
    .where({AZID: id})
    .fetch({withRelated: ['users']})
    .then(function(tool){

      var toolJson = tool.toJSON();
      var access = false;
      toolJson['users'].forEach(function(user){
        logger.debug(user);
        if(userID==user.USER_ID){
          access = true;
        }
      });
      if(access==false){
        return util.showStatus(req, res, 'error', 'You do not have permission to edit this tool.');
      }
      else{
        var loginName = 'Login';
        if(req.isAuthenticated())
          loginName = req.user.attributes.FIRST_NAME;
        return res.render('form.ejs', {title: "Edit",
          heading: "Edit Resource #"+id,
          name: loginName,
          loggedIn : req.isAuthenticated(),
          editURL: "..",
          submitFunc: "onEditSubmit()",
          init: "data-ng-init=vm.initEdit("+id+")"});
      }
    })
    .catch(function(err){
      return res.send({
        status: 'error',
        message: 'Invalid AZID'
      });
    })
};

UserController.prototype._getSaved = function(self, req, res){
  var id = req.params.id;

  if(req.isAuthenticated() && req.user!=undefined){
    SavedTool.findOne({user: req.user.attributes.EMAIL, '_id' : id}, function(err, tool){
      if(err || tool==null){
        return util.showStatus(req, res, 'error', 'Resource not found');
      }else{
        return res.render('form.ejs', {title: "Register",
          heading: "Register New Resource",
          name: req.user.attributes.FIRST_NAME,
          loggedIn : true,
          editURL: "..",
          submitFunc: "onNewSubmit()",
          init: "data-ng-init=vm.initSaved(\'"+id+"\')"});
        }
      });
  }
  else{
    return util.showStatus(req, res, 'error', 'Not logged in');
  }
};

UserController.prototype._getSavedAPI = function(self, req, res){
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
}

UserController.prototype._getAllSaved = function(self, req, res){
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


module.exports = new UserController();
