var Bookshelf = require('../../config/bookshelf.js');
var Tool = require('./tool.js');

// define the schema for our tool model
var domainSchema = Bookshelf.Model.extend({

    tableName: 'BIOLOGICAL_DOMAIN',
    idAttribute: 'DOMAIN_ID',
    tools: function() {
      return this.belongsToMany(Tool, 'TOOL_DOMAINS', 'AZID', 'DOMAIN_ID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = domainSchema;
