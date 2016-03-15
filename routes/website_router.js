var express = require('express');
var router = express.Router();
var util = require('../utility/generalUtil.js');
var ToolController = require('../controllers/tool-controller');
var HomeController = require('../controllers/home-controller');
var UserController = require('../controllers/user-controller');



/* GET home page. */
router.get('/', HomeController.home);


// website
router.get('/home', isLoggedIn, UserController.home);

router.get('/all', HomeController.allTools);

router.get('/tool/:id', ToolController.show);

router.get('/reg', isLoggedIn, UserController.register);

router.post('/reg', ToolController.create);

router.get('/saved/:id', UserController.getSaved);

router.post('/save', ToolController.save);

router.get('/edit/:id', UserController.edit);

router.put('/edit/:id', verifyRecaptcha, ToolController.update);

router.post('/login', HomeController.login );

router.get('/logout', isLoggedIn, HomeController.logout);

router.post('/signup', HomeController.signup);


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
