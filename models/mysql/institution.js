var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');
var Alias = require('./inst_alias.js');

// define the schema for our tool model
var institutionSchema = Bookshelf.Model.extend({

    tableName: 'INSTITUTION',
    idAttribute: 'INST_ID',
    tools: function() {
      return this.belongsToMany(Tool, 'TOOL_INSTITUTION', 'AZID', 'INST_ID');
    },
    aliases: function() {
      return this.hasMany(Alias);
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = institutionSchema;
