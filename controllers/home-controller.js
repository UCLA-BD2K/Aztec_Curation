var passport = require('passport');
var logger = require("../config/logger");
var util = require('../routes/utilities/util.js');
var User  = require('../models/mysql/user.js');
var Tool  = require('../models/mysql/tool.js');



function HomeController(){
  var self = this;

  this.home = function(req, res){ self._home(self, req, res); };
  this.login = function(req, res){ self._login(self, req, res); };
  this.signup = function(req, res){ self._signup(self, req, res); };
  this.logout = function(req, res){ self._logout(self, req, res); };
  this.allTools = function(req, res){ self._allTools(self, req, res); };
}

HomeController.prototype._home = function(self, req, res){
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;
    return res.render('index.ejs', {name: loginName, loggedIn : req.isAuthenticated()});
};


HomeController.prototype._login = function(self, req, res){
  var response = {};
  passport.authenticate('local', function(err, user, info) {

    if(err) {
      response = {
                    loggedIn: false,
                    error: err.message
                 };
      res.send(response);
    }
    else if(!user) {
       response = {
                    loggedIn: false,
                    error: info.message
                 };
       res.send(response);
    }
    else{
      return req.logIn(user, function(err) {
         if(err) {
           response = {
                         loggedIn: false,
                         error: err.message
                      };
         } else {
           response = {
                         loggedIn: true,
                         error: ''
                      };
         }
         res.send(response);
      });
  }
 })(req, res);
};

HomeController.prototype._signup = function(self, req, res){
  logger.debug(req.body);
  var user = req.body;
   var usernamePromise = null;
   usernamePromise = new User({EMAIL: user.email}).fetch();

   return usernamePromise.then(function(model) {
      if(model) {
         res.send( {error: 'username already exists'} );
      } else {
         //****************************************************//
         // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
         //****************************************************//
         var password = user.password;
         var hash = bcrypt.hashSync(password);
         logger.debug(user.email);
         var signUpUser = new User({
           EMAIL: user.email,
           FIRST_NAME: user.firstname,
           LAST_NAME: user.lastname,
           POSITION: user.position,
           PASSWORD: hash
         });

         signUpUser.save().then(function(model) {
            // sign in the newly registered user
            self.login(req, res, next);
         });
      }
   });

};

HomeController.prototype._logout = function(self, req, res){
  if(req.isAuthenticated()) {
      req.logout();
  }
  res.redirect('/');
};

HomeController.prototype._allTools = function(self, req, res){
  var loginName = 'Login';
  if(req.isAuthenticated())
    loginName = req.user.attributes.FIRST_NAME;
  Tool.forge()
    .fetchAll({withRelated: ['users']})
    .then(function(tool){
      if(tool==null){
        return res.render('all.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'not found'});
      }
      else{
        logger.debug(JSON.stringify(tool));
        return res.render('all.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: tool});
      }
    })
    .catch(function(err){
      logger.info('query tool error');
      logger.debug(err);
      return res.render('all.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'error'});
    })
};

module.exports = new HomeController();
