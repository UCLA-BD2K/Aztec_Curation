// load the things we need
var mongoose = require('mongoose');

// define the schema for our link model
var linkSchema = mongoose.Schema({

      link_name         : String,
      link_url          : String

});


// create the model for links and expose it to our app
module.exports = mongoose.model('Link', linkSchema);
