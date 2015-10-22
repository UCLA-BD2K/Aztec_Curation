var Tool = require('../../models/mysql/tool.js');
var Author = require('../../models/mysql/author.js');
var Agency = require('../../models/mysql/agency.js');

module.exports = {
  //input: azid(integer), with(array of relations), callback(function(param1))
  // extra: ['links', 'authors', 'domains', 'downstream', 'upstream', 'extension', 'agency', 'funding', 'ioformat', 'license', 'platform', 'version', 'map', 'io']
  queryTool: function(azid, extra, callback){
    (new Tool).where('AZID', azid)
      .fetch({withRelated: extra})
      .then(function(tool) {
        console.log('Queried tool '+azid+' found:' +tool.toJSON());
        return callback(tool.toJSON());
      })
      .catch(function(err) {

        console.error(err);
        return callback(err);
    });
  },
  // input: toolInfo(json object), type('insert' or 'update'), callback(function(param1))
  saveToolInfo: function(toolInfo, type, callback){
    var id = parseInt(toolInfo.AZID);
    delete toolInfo['AZID'];
    console.log('saving '+JSON.stringify(toolInfo));
    (new Tool).where('AZID', id)
      .save(toolInfo, { method : type})
      .then(function(tool) {
          return callback(tool.toJSON());
        })
      .catch(function(err) {

        console.error(err);
        return callback(err);

      });
  },

  queryAgency: function(id, callback){
    (new Author).where('AUTHOR_ID', id)
      .fetch()
      .then(function(author) {
        console.log('Queried agency '+id+' found:' +author.toJSON());
        return callback(author.toJSON());
      })
      .catch(function(err) {

        console.error(err);
        return callback(err);
    });
  },
  saveAgency: function(author, type, callback){
    console.log('saving '+JSON.stringify(author));
    (new Author).save(agency, { method : type})
      .then(function(a) {
          return callback(a.toJSON());
        })
      .catch(function(err) {

        console.error(err);
        return callback(err);

      });
  },
};
