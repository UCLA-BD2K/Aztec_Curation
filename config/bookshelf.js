var mysql      = require('mysql');
var dbConfig = require('./mysql.js');
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
