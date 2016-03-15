var ToolModel = require('../models/Tool');
var logger = require("../config/logger");


function ToolController(){
  var self = this;
  this.showAll = function(req, res){ self._showAll(self, req, res); };
  this.show = function(req, res){ self._show(self, req, res); };
  this.create = function(req, res){ self._create(self, req, res); };
  this.update = function(req, res){ self._update(self, req, res); };
  this.edit = function(req, res){ self._edit(self, req, res); };
  this.save = function(req, res){ self._save(self, req, res); };
  this.api = function(req, res){ self._api(self, req, res); };
}

ToolController.prototype._showAll = function(self, req, res){
  var tool = new ToolModel();
  return tool.showAll(function(t){
    res.send(t);
  });
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
  return tool.add(req.user, req.body, function(t){
    res.send(t);
  });
};

ToolController.prototype._edit = function(self, req, res){

};

ToolController.prototype._update = function(self, req, res){
  var tool = new ToolModel();
  return tool.update(req.query.id, req.body, function(t){
    res.send(t);
  });
};

ToolController.prototype._save = function(self, req, res){
  var tool = new ToolModel();
  return tool.save(req.user, req.body, function(t){
    res.send(t);
  });
};

ToolController.prototype._api = function(self, req, res){
  if(req.params['id']!=undefined && !isNaN(req.params['id'])){
    var tool = new ToolModel();
    return tool.show(req.params['id'], function(t){
      res.send(t);
    });
  }else{
    var response = {
      status  : 'error',
      error   : 'Invalid input'
    };
    return res.send(response);
  }
};

module.exports = new ToolController();
