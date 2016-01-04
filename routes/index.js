var express = require('express');
var router = express.Router();
var test = require('./test.js');
var register = require('./register.js');
var login = require('./login.js');


/* GET home page. */
router.get('/', login.getHome);

router.get('/testEdit', test.getEdit);

router.post('/testEdit', test.postEdit);

router.get('/testWrite', test.getWrite);

router.get('/testRead', test.getRead);

router.get('/testForm', test.getForm);

router.post('/testForm', test.postForm);

router.get('/testQuery', test.getQuery);

router.get('/create', isLoggedIn, login.getOldReg);

router.get('/reg', isLoggedIn, login.getReg);

router.post('/create', register.saveTool);

router.post('/login', login.postLogin );

router.get('/logout', login.getLogout);

router.post('/signup', login.postSignup);

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


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

module.exports = router;
