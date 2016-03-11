var ToolModel = require('../models/Tool');
var logger = require("../config/logger");


function ToolController(){
  var self = this;

  this.show = function(req, res){ self._show(self, req, res); };
  this.create = function(req, res){ self._create(self, req, res); };
  this.update = function(req, res){ self._update(self, req, res); };
  this.edit = function(req, res){ self._edit(self, req, res); };
  this.save = function(req, res){ self._save(self, req, res); };
}

ToolController.prototype._show = function(self, req, res){
  var loginName = 'Login';
  if(req.isAuthenticated())
    loginName = req.user.attributes.FIRST_NAME;

  logger.info('Find tool #%s', req.params.id);

  return res.render('tool.ejs', {name: loginName, loggedIn : req.isAuthenticated(), azid: req.params.id});
};

ToolController.prototype._create = function(self, req, res){
  var tool = new ToolModel();
  return tool.add(req.user, req.body, res);
};

ToolController.prototype._edit = function(self, req, res){

};

ToolController.prototype._update = function(self, req, res){
  var tool = new ToolModel();
  return tool.update(req.query.id, req.body, res);
};

ToolController.prototype._save = function(self, req, res){
  var tool = new ToolModel();
  return tool.save(req.user, req.body, res);
};


module.exports = new ToolController();
