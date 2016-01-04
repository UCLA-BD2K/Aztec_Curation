var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var languageSchema = Bookshelf.Model.extend({

    tableName: 'LANGUAGE',
    idAttribute: 'LANG_ID',
    tools: function() {
      return this.belongsToMany(Tool, 'TOOL_LANG', 'AZID', 'LANG_ID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = languageSchema;
