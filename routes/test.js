var db = require('./db/database.js');
var test = require('./db/test.js');

module.exports = {
  getEdit: function(req, res, next) {
    var query = req.query.q;

    var render = function(status){
      res.render('testEdit.ejs', {message: status});
    };
    console.log('Reading: '+query);
    test.readWholeEntry(req, query, render);

  },
  postEdit: function(req, res, next) {

  	var AZID = req.body.AZID;
  	console.log("the AZID is " + AZID);

  	var render = function(status){
  		res.send("Submission accepted.");
  	};
  	test.writeNewObject(AZID, req.body, render);

  },
  getWrite: function(req, res, next) {
    var newReqs = req.query.c;
    var id = req.query.i;
    var render = function(status){
      res.render('testWrite.ejs', {message: status});
    };
    console.log('Writing:'+id+' '+newReqs);
    test.writeNewReqs(req, id, newReqs, render);
  },
  getRead: function(req, res, next) {
    var query = req.query.q;
    var render = function(status){
      res.render('testRead.ejs', {message: status});
    };
    console.log('Reading: '+query);
    test.readWholeEntry(req, query, render);

  },
  getForm: function(req, res, next) {
    var query = req.query.q;

    var render = function(status){
      res.render('testForm.ejs', {message: JSON.stringify(status)});
    };
    console.log('Reading: '+query);
    db.queryTool(query, ['authors', 'resource_types', 'domains', 'tags', 'languages', 'institutions'], render);
  },
  postForm: function(req, res, next) {
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

  },
  getQuery: function(req, res, next) {
    var query = req.query.q;

    var render = function(status){
      res.render('testRead.ejs', {message: JSON.stringify(status)});
    };
    console.log('Reading: '+query);
    db.queryAuthor(query, render);
  }
}
