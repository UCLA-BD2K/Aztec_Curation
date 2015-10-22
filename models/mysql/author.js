var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var authorSchema = Bookshelf.Model.extend({

    tableName: 'AUTHOR',
    idAttribute: 'AUTHOR_ID',
    tools: function() {
      return this.belongsToMany(Tool, 'TOOL_AUTHOR', 'AZID', 'AUTHOR_ID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = authorSchema;
