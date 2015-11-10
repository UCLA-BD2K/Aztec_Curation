var express = require('express');
var router = express.Router();
var test = require('./db/test.js');
var db = require('./db/database.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});
router.use(express.static(__dirname + '/public')); //just added 

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

module.exports = router;
