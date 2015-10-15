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
        return finished(JSON.stringify(tool.toJSON()));

      })
      .catch(function(err) {

        console.error(err);
        return finished(err);

    });
  }

};
