var express = require('express');
var router = express.Router();
var test = require('../db/test.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

router.get('/testWrite', function(req, res, next) {
  var newReqs = req.query.c;
  var toolName = req.query.n;
  var render = function(status){
    res.render('testWrite.ejs', {message: status});
  };
  console.log('Writing:'+toolName+' '+newReqs);
  test.writeNewReqs(req, toolName, newReqs, render);
});



router.get('/testRead', function(req, res, next) {
  var query = req.query.q;
  var render = function(status){
    res.render('testRead.ejs', {message: status});
  };
  console.log('Reading: '+query);
  test.readTestEntry(req, query, render);

});

module.exports = router;
