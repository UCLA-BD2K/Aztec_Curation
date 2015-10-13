var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

router.get('/testIn', function(req, res, next) {
  res.render('testIn.ejs');
});

router.post('/testIn', function(req, res, next) {
  var query = req.body.query;
  console.log('query '+query);


  res.redirect('/testOut?q='+query);
});

router.get('/testOut', function(req, res, next) {

  var query = req.query.q;
  console.log('query '+query);
  req.getConnection(function(err, connection) {
      if (err) return next(err);
      connection.query('SELECT * FROM TOOL_INFO WHERE NAME LIKE \''+query+'\'', [], function(err, results) {
        if (err) return next(err);
        var result = JSON.stringify(results[0]);
        if(result==null)
          result = 'Not Found';
        console.log(result);
        res.render('testOut.ejs', {message: result});
        // -> 1


      });

    });

});

module.exports = router;
