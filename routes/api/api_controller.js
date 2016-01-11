var Bookshelf = require('../../config/bookshelf.js');

module.exports = {
  getHome: function(req, res, next) {
    res.send('This is the Aztec Review API');
  }
};
