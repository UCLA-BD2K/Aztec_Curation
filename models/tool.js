var Bookshelf = require('../config/bookshelf');

// define the schema for our tool model
var toolSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_INFO'

});

// methods ======================


// create the model for tools and expose it to our app
module.exports = toolSchema;
