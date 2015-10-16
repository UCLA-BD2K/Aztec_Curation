var Bookshelf = require('../../config/bookshelf');
var Tool = require('../tool.js');

// define the schema for our tool model
var licenseSchema = Bookshelf.Model.extend({

    tableName: 'LICENSE',
    idAttribute: 'LICENSE_ID',
    tool: function() {
      return this.belongsToMany(Tool, 'TOOL_LICENSE', 'AZID', 'LICENSE_ID');
    }

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = licenseSchema;
