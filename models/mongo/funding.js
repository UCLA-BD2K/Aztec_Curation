// load the things we need
var mongoose = require('mongoose');

// define the schema for our funding model
var fundingSchema = mongoose.Schema({

      agency_id       : Number,
      funding_agency  : String,
      funding_grant   : String

});


// create the model for funding and expose it to our app
module.exports = mongoose.model('Funding', fundingSchema);
