var suggester = require('../suggester.js');

module.exports = {
  writeNewReqs: function(req, id, newReqs, finished){
    var Tool = require('../../models/tool.js');
    (new Tool).where('AZID', parseInt(id))
      .save({SPECIAL_REQ : newReqs}, { method : 'update'})
      .then(function(tool) {
          if(tool==null)
            return finished('Tool with ID '+id+' was not found!');
          return finished(JSON.stringify(tool.toJSON()));
        })
      .catch(function(err) {

        console.error(err);
        return finished(err);

      });
  },
  writeNewObject: function(id, newToolObject, finished){
    var Tool = require('../../models/tool.js');
    (new Tool).where('AZID', parseInt(id))
      .save(newToolObject, { method : 'update'})
      .then(function(tool) {
          if(tool==null)
            return finished('Tool with ID '+id+' was not found!');
          return finished(JSON.stringify(tool.toJSON()));
        })
      .catch(function(err) {

        console.error(err);
        return finished(err);

      });
  },
  readTestEntry: function(req, toolName, finished){

    var Tool = require('../../models/tool.js');
    (new Tool).where('NAME', toolName)
      .fetch()
      .then(function(tool) {
        if(tool==null)
          return finished(toolName+' not found!');
        console.log(tool.toJSON());

	/*var suggestions = suggester.generateSuggestions(tool.toJSON());
	console.log("here are the suggestions:");
	console.log(suggestions);*/

        return finished(JSON.stringify(tool.toJSON()));

      })
      .catch(function(err) {

        console.error(err);
        return finished(err);

    });
  },
  readWholeEntry: function(req, toolName, finished){
    var Tool = require('../../models/tool.js');
    (new Tool).where('NAME', toolName)
      .fetch({withRelated: ['links', 'authors', 'domains', 'downstream', 'upstream', 'extension', 'agency', 'funding', 'format', 'license', 'platform', 'version', 'map', 'io']})
      .then(function(tool) {
        if(tool==null)
          return finished(toolName+' not found!');
        console.log(tool.toJSON());
        return finished(JSON.stringify(tool.toJSON()));

      })
      .catch(function(err) {

        console.error(err);
        return finished(err);

    });
  }

};
