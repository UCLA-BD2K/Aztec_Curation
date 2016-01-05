var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var User  = require('../models/mysql/user.js');
var Tool  = require('../models/mysql/tool.js');


function loginPost(req, res, next) {
    console.log(req.body);
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
      console.log(req.body);
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
             console.log(user);
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
      console.log(1);
      console.log('user', req.user);
      if(req.isAuthenticated())
        loginName = req.user.attributes.FIRST_NAME;
      res.render('register.ejs', {name: loginName, loggedIn : req.isAuthenticated()});

  },
  getReg: function(req, res, next) {
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;
    res.render('reg.ejs', {name: loginName, loggedIn : req.isAuthenticated()});

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
          console.log('Found existing user:', user.attributes.FIRST_NAME);
           console.log('tools', user.tools());
          return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: user});

        }
      })
      .catch(function(err){
        console.log('query user error', err);
        return res.render('portal.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'error'});
      })
  },
  getAllTools: function(req, res, next) {
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;
    Tool.forge()
      .fetchAll()
      .then(function(tool){
        if(tool==null){
          return res.render('all.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'not found'});
        }
        else{
          console.log('tools', tool);
          return res.render('all.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: tool});
        }
      })
      .catch(function(err){
        console.log('query tool error', err);
        return res.render('all.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'error'});
      })
  },
  getTool: function(req, res, next) {
    var loginName = 'Login';
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;

    console.log('find tool ', req.params.id);
    Tool.forge()
      .query({where: {AZID: req.params.id}})
      .fetch({withRelated: ['authors', 'links', 'domains', 'agency', 'funding', 'license', 'platform', 'version', 'tags', 'users', 'resource_types', 'languages']})
      .then(function(tool){
        if(tool==null){
          return res.render('tool.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'not found'});
        }
        else{
          console.log('tools', tool);
          return res.render('tool.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: tool});
        }
      })
      .catch(function(err){
        console.log('query tool error', err);
        return res.render('tool.ejs', {name: loginName, loggedIn : req.isAuthenticated(), data: 'error'});
      })
  },
  getToolByAZID: function(req, res, next) {
    var azid = req.params[0];
    var regex = /(AZ\d{7})/;
    if(azid.length!=9){
      console.log('not valid!');
    }else{
      var match = azid.match(regex);
      console.log('match', match);
      if(match!=null){
        var id = parseInt(azid.substring(2));
        console.log('id number', id);
        res.redirect('/tool/'+id);
      }
    }
  },

};
