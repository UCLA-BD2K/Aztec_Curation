var express = require('express');
var router = express.Router();
var test = require('./db/test.js');
var db = require('./db/database.js');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/mysql/user.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(bcrypt.hashSync('testing123'));
  var loginName = 'Login';
  if(req.isAuthenticated())
    loginName = req.user.attributes.FIRST_NAME;
  res.render('index.ejs', {name: loginName, loggedIn : req.isAuthenticated()});
});

router.get('/testEdit', function(req, res, next) {
  var query = req.query.q;

  var render = function(status){
    res.render('testEdit.ejs', {message: status});
  };
  console.log('Reading: '+query);
  test.readWholeEntry(req, query, render);

});

router.post('/testEdit', function(req, res, next) {

	var AZID = req.body.AZID;
	console.log("the AZID is " + AZID);

	var render = function(status){
		res.send("Submission accepted.");
	};
	test.writeNewObject(AZID, req.body, render);

});

router.get('/testWrite', function(req, res, next) {
  var newReqs = req.query.c;
  var id = req.query.i;
  var render = function(status){
    res.render('testWrite.ejs', {message: status});
  };
  console.log('Writing:'+id+' '+newReqs);
  test.writeNewReqs(req, id, newReqs, render);
});

router.get('/testRead', function(req, res, next) {
  var query = req.query.q;
  var render = function(status){
    res.render('testRead.ejs', {message: status});
  };
  console.log('Reading: '+query);
  test.readWholeEntry(req, query, render);

});

router.get('/suggestion', function(req, res, next) {
	var query = req.query.q;
	var azid = req.query.AZID;
	var field = req.query.field;

	//console.log("field is " + field);

	var suggester = require('./suggester.js');
	var suggest = function(toolJson){
		suggester.generateSuggestion(toolJson,field,function(actualSuggestion){
	    		res.send(actualSuggestion);
		});
	  };

	test.readWholeEntry(req, query, suggest);
});

router.get('/github', function (req, res, next) {
    var name = req.query.name;

    var suggester = require('./suggester.js');
        suggester.githubSuggestion(name, function (actualSuggestion) {
            res.send(actualSuggestion);
        });
});

router.get('/pubmed', function (req, res, next) {
    var name = req.query.name;

    var suggester = require('./suggester.js');
    suggester.pubmedSuggestion(name, function (actualSuggestion) {
        res.send(actualSuggestion);
    });
});


router.get('/testForm', function(req, res, next) {
  var query = req.query.q;

  var render = function(status){
    res.render('testForm.ejs', {message: JSON.stringify(status)});
  };
  console.log('Reading: '+query);
  db.queryTool(query, ['authors'], render);
});

router.post('/testForm', function(req, res, next) {
	//console.log(req.query);
	console.log("post request body:");
	console.log(req.body);

	var AZID = req.body.toolInfo^AZID;
	console.log("the AZID is " + AZID);

	var render = function(status){
	    res.render('testRead.ejs', {message: JSON.stringify(status)});
	};
  console.log(req.body);
  db.saveTool(req.body, render);
	//db.saveToolInfo(req.body, 'update', render);

});

router.get('/testQuery', function(req, res, next) {
  var query = req.query.q;

  var render = function(status){
    res.render('testRead.ejs', {message: JSON.stringify(status)});
  };
  console.log('Reading: '+query);
  db.queryAuthor(query, render);
});

router.get('/create', function(req, res, next) {
    var loginName = 'Login';
    console.log(1);
    console.log(req.user);
    if(req.isAuthenticated())
      loginName = req.user.attributes.FIRST_NAME;
    res.render('register.ejs', {name: loginName, loggedIn : req.isAuthenticated()});

});

var loginPost = function(req, res, next) {
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
router.post('/login', loginPost );

router.get('/logout', function(req, res, next){
  if(req.isAuthenticated()) {
      req.logout();
      res.redirect('/');
   }
});

router.post('/signup', function(req, res, next) {
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

});

module.exports = router;
