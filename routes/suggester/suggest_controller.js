var Bookshelf = require('../../config/bookshelf.js');
var suggester = require('./suggester.js');
var util = require('../utilities/util.js');

module.exports = {
  postQuery: function(req, res, next) {
      var query = req.body;
      //var azid = req.query.AZID;
      var field = req.query.field;
      console.log(JSON.stringify(query), field);
      console.log(query['basic[name]']);

      //console.log("field is " + field);

      var suggest = function(toolJson){
        console.log('suggesting');
          suggester.generateSuggestion(util.unflatten(toolJson),field,function(actualSuggestion){
                  res.send(actualSuggestion);
          });
        };

      suggest(query);
      //test.readWholeEntry(req, query, suggest);
  },
  getGithub: function (req, res, next) {
      var name = req.query.name;

          suggester.githubSuggestion(name, function (actualSuggestion) {
              res.send(actualSuggestion);
          });
  },
  getPubmed: function (req, res, next) {
      var name = req.query.name;

      suggester.pubmedSuggestion(name, function (actualSuggestion) {
          res.send(actualSuggestion);
      });
  }

};
