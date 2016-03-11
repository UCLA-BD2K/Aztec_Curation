var config = require('./app.json');
var Util = require('../utility/generalUtil');
var mysql      = require('mysql');
var dbConfig = {
  client: 'mysql',
  connection: {
    host     : config.mysqlHost,
    port     : config.mysqlPort,
    user     : Util.decrypt('user', config.mysqlUser),
    password : Util.decrypt('password', config.mysqlPassword),
    database : config.mysqlDB,
    charset: 'utf8'
  },
  pool: {
    min: 0,
    max: 4
  }
};
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
