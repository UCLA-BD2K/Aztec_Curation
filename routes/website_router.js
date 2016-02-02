var express = require('express');
var router = express.Router();
var test = require('./test.js');
var register = require('./register.js');
var login = require('./login.js');
var edit = require('./edit.js');
var util = require('./utilities/util.js');


/* GET home page. */
router.get('/', login.getHome);


// Tests
router.get('/testEdit', test.getEdit);

router.post('/testEdit', test.postEdit);

router.get('/testWrite', test.getWrite);

router.get('/testRead', test.getRead);

router.get('/testForm', test.getForm);

router.post('/testForm', test.postForm);

router.get('/testQuery', test.getQuery);


// website
router.get('/home', isLoggedIn, login.getPortal);

router.get('/all', isLoggedIn, login.getAllTools);

router.get('/tool/:id', isLoggedIn, login.getTool);

router.get('/id/:azid', login.getToolByAZID);

router.get('/create', isLoggedIn, login.getOldReg);

router.get('/reg', isLoggedIn, login.getReg);

router.post('/reg', register.saveTool);

router.get('/saved/:id', login.getSaved);

router.post('/save', login.postSave);

router.get('/edit/:id', login.getEdit);

router.put('/edit/:id', verifyRecaptcha, edit.putEdit);

router.post('/login', login.postLogin );

router.get('/logout', isLoggedIn, login.getLogout);

router.post('/signup', login.postSignup);


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    return util.showStatus(req, res, 'error', 'Not logged in')
}

function verifyRecaptcha(req, res, next){
  console.log(req.body);
  var recaptcha = req.body.recaptcha;
  // if (!req.isAuthenticated())
  //   return res.redirect('/');
    var https = require("https");
    https.get('https://www.google.com/recaptcha/api/siteverify?secret=6Lc4DxYTAAAAAAoYu7jSvX3CXGQ_xyzE4qkC8KOG&response='+recaptcha, function(response){
      response.on('data', function(data) {
             var success = JSON.parse(data);
             console.log(success);
             if(success['success']){
               return next();
             }
             else{
               var response = {};
               response.success = false;
               response.message = "Error: Recaptcha";
               return res.send(response);
             }
        });
    });
}

module.exports = router;
