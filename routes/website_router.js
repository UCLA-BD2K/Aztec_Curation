var express = require('express');
var router = express.Router();
var util = require('../utility/generalUtil.js');
var ToolController = require('../controllers/tool-controller');
var HomeController = require('../controllers/home-controller');
var UserController = require('../controllers/user-controller');
var PdfController = require('../controllers/pdf-controller.js');
var multer  = require('multer');
var mkdirp = require('mkdirp');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
   var user = req.user.attributes.USER_ID;
   var path = 'slots-extraction/data/'+ user;
    mkdirp(path, cb, function(e){ // make this mkdirp - right now it runs if folders exist 
        cb(null, path); // path earlier
    }); 
  }
});
var upload = multer({storage:storage});
// var upload = multer({dest:'slots-extraction/data/1/papers/' }); //
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

router.post('/pdf-upload', upload.single('pdf'), PdfController.upload);

router.post('/pdf-delete', PdfController.delete_file);
// fix this 
// function file_upload(self,req, res){
//   var user = req.user.attributes.USER_ID;
  // var exec = require('child_process').exec;
  // const execFile = require('child_process').execFile;
  // const child = execFile('bash', ['/Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/scripts/create_folder.sh',user], (error, stdout, stderr) => {
  // if (error) {
  // }
  //     console.log(stdout);
  // });  
//   console.log("User ID here is ");
//   console.log(user);
//   var base_path = 'slots-extraction/data/';
//   var destination = base_path + user + '/papers/';
//    console.log("dest  here is ");
//   console.log(destination);
//   var upload = multer({dest: destination}); //'slots-extraction/data/papers/'
//   // var uploaded_pdf = upload.single('pdf');
//   return upload.single('pdf');
// };

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
