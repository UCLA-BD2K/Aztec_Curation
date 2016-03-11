var config = require('./app.json');
var Util = require('../utility/generalUtil');

// config/mongo.js
module.exports = {

    'url' : 'mongodb://'+
    Util.decrypt('user', config.mongoUser)+':'+
    Util.decrypt('password', config.mongoPassword)+'@'+
    config.mongoHost+':'+config.mongoPort+'/Tool' 

};
