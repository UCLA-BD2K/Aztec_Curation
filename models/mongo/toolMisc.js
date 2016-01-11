// load the things we need
var mongoose = require('mongoose');
var Link = require('./link.js');
var Version = require('./version.js');
var Funding = require('./funding.js');
var Publication = require('./publication.js');

// define the schema for our toolMisc model
var toolSchema = mongoose.Schema({
    azid             : Number,
    links            : [Link.schema],
    publications     : [Publication.schema],
    versions         : [Version.schema],
    funding          : [Funding.schema]

});


// create the model for tools and expose it to our app
module.exports = mongoose.model('Tool', toolSchema);
