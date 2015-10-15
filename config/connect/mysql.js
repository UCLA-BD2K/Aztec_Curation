module.exports = {
  client: 'mysql',
  connection: {
    host     : 'localhost',
    port     : '3306',
    user     : 'developer',
    password : 'ucla2015',
    database : 'AZ_Curation',
    charset: 'utf8'
  },
  pool: {
    min: 0,
    max: 4
  }
};
