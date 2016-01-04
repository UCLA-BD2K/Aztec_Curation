var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var User  = require('../models/mysql/user.js');


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
    console.log(bcrypt.hashSync('testing123'));
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

      res.render('reg.ejs', {loggedIn : req.isAuthenticated()});

  },



};
