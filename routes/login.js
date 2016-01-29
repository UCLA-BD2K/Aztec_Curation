var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var User  = require('../models/mysql/user.js');
var Tool  = require('../models/mysql/tool.js');
var SavedTool  = require('../models/mongo/savedTool.js');
var util = require('./utilities/util.js');
var db = require('./utilities/db.js');
var logger = require("../config/logger");


function loginPost(req, res, next) {
    logger.debug(req.body);
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
   })(req, res, next);
};

module.exports = {
  getHome: function(req, res, next) {
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;
    res.render('index.ejs', {name: loginName, loggedIn : req.isAuthenticated()});
  },
  postLogin: loginPost,
  postSignup: function(req, res, next) {
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
             logger.debug(user);
             var signUpUser = new User({
               EMAIL: user.email,
               FIRST_NAME: user.firstname,
               LAST_NAME: user.lastname,
               POSITION: user.position,
               PASSWORD: hash
             });

             signUpUser.save().then(function(model) {
                // sign in the newly registered user
                loginPost(req, res, next);
             });
          }
       });

  },
  getLogout: function(req, res, next){
    if(req.isAuthenticated()) {
        req.logout();
        res.redirect('/');
     }
  },
  getOldReg: function(req, res, next) {
      var loginName = 'Login';
      if(req.isAuthenticated())
        loginName = req.user.attributes.FIRST_NAME;
      res.render('register.ejs', {name: loginName, loggedIn : req.isAuthenticated()});

  },
  getReg: function(req, res, next) {
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;
    else {
      return util.showStatus(req, res, 'error', 'Not logged in');
    }

    res.render('form.ejs', {title:"Register", heading:"Register New Resource", name: loginName, loggedIn : req.isAuthenticated(), editURL: ".", submitFunc: "onNewSubmit()", tool: null, init: ""});

  },
  getPortal: function(req, res, next) {
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;
    User.forge()
      .query({where: {USER_ID: req.user.attributes.USER_ID}})
      .fetch({withRelated: ['tools']})
      .then(function(user){
        if(user==null){
          return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'not found'});
        }
        else{
          logger.info('Found existing user: %s', user.attributes.FIRST_NAME);
          logger.debug(user.tools());
          return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: user});

        }
      })
      .catch(function(err){
        logger.info('query user error');
        logger.debug(err);
        return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'error'});
      })
  },
  getAllTools: function(req, res, next) {
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
  },
  getTool: function(req, res, next) {
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;

    logger.info('Find tool #%s', req.params.id);
    Tool.forge()
      .query({where: {AZID: req.params.id}})
      .fetch({withRelated: ['authors', 'links', 'domains', 'agency', 'funding', 'license', 'platform', 'version', 'tags', 'users', 'resource_types', 'languages']})
      .then(function(tool){
        if(tool==null){
          return res.render('tool.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'not found'});
        }
        else{
          return res.render('tool.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: tool});
        }
      })
      .catch(function(err){
        logger.info('query tool error');
        logger.debug(err);
        return res.render('tool.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'error'});
      })
  },
  getToolByAZID: function(req, res, next) {
    var azid = req.params.azid;
    var regex = /(AZ\d{7})/;
    if(azid.length!=9){
      logger.info('Invalid AZID: %s', azid);
    }else{
      var match = azid.match(regex);
      logger.debug(match);
      if(match!=null){
        var id = parseInt(azid.substring(2));
        logger.debug('id number: %d', id);
        res.redirect('/tool/'+id);
      }
    }
    res.send('invalid AZID');
  },
  getEdit: function(req, res, next){
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
          db.searchToolByID(id, function(result){
            return res.render('form.ejs', {title: "Edit",
              heading: "Edit Resource #"+id,
              name: loginName,
              loggedIn : req.isAuthenticated(),
              editURL: "..",
              submitFunc: "onEditSubmit()",
              tool: result,
              init: "data-ng-init=vm.init("+id+")"});
          });
        }
      })
      .catch(function(err){
        return res.send({
          status: 'error',
          message: 'Invalid AZID'
        });
      })

  },
  postSave: function(req, res, next){
    var tool = req.body;
    console.log(tool);
    var saveTool = new SavedTool({ tool: util.unflatten(tool) });
    saveTool.user = req.user.attributes.EMAIL;
    console.log(saveTool);
    saveTool.save(function (err) {
      if(err){
        logger.info('mongo error');
        logger.debug(err);
      }
      logger.debug('mongo success');
    });
    res.send({
      status: 'success',
      message: 'Saved tool'
    });
  }

};
