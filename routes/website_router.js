var express = require('express');
var router = express.Router();
var test = require('./test.js');
var register = require('./register.js');
var login = require('./login.js');
var edit = require('./edit.js');


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

router.post('/reg', isLoggedIn, register.saveTool);

router.get('/edit/:id', login.getEdit);

router.put('/edit/:id', isLoggedIn, edit.putEdit);

router.post('/login', login.postLogin );

router.get('/logout', isLoggedIn, login.getLogout);

router.post('/signup', login.postSignup);


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

module.exports = router;
