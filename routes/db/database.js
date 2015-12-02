var async = require('async');
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
          return callback("TOOLS_INFO SAVED!");
        })
      .catch(function(err) {
        console.error(err);
        return callback(err);

      });
  },

  queryAuthor: function(id, callback){
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
  saveAuthor: function(authors, type, callback){
      authors.forEach(function(author) {
          console.log("Saving AUTHOR:", author);
          type = 'update'; //'insert' or 'update' TODO: check if Author already exists in Database
          (new Author).where("AUTHOR_ID", parseInt(author.AUTHOR_ID))
              .save(author, {method: type})
              .then(function () {
                  //console.log("AUTHOR SAVED!")
                  return callback("AUTHOR SAVED!");
              })
              .catch(function (err) {
                  //console.error(err);
                  console.log("ERROR SAVING TO AUTHOR TABLE")
                  return callback(err);
              })
      });
  },
  saveTool: function(obj, callback){
    var toolInfo = {};
    var authors = [];

    for (var prop in obj) {
        var tokens = prop.split('^'); //This is the name of the form parameters passed authors^#^AUTHOR_ID or toolsInfo^NAME
        var len = tokens.length;
        //console.log(tokens);
        switch(tokens[0]){
          case 'toolInfo':
            toolInfo[tokens[len-1]] = obj[prop]; //Create a tool object with name tokens[len-1] and value of obj[prop]
            break;
          case 'authors':
            if(authors.length==0)
              authors.push({}); //If the author's array is empty, push a new empty object onto it.
            else if(len > 2 && (authors.length-1) != Number(tokens[1]))
              authors.push({});
            authors[authors.length-1][tokens[len-1]] = obj[prop] //Set the attributes of the last obj in author to its right values
            break;
          default:
            //Should not reach here
        }
    }
      //DOING UPDATES USING ASYNC
      async.series([
          function(callbackAsync) { //Save Tools_Info
              var id = parseInt(toolInfo.AZID);
              delete toolInfo['AZID'];
              var type = 'update'; //'insert' or 'update' TODO: check if Author already exists in Database
              console.log('SAVING TOOLS_INFO', toolInfo);
              (new Tool).where('AZID', id)
                  .save(toolInfo, {method: type})
                  .then(function (tool) {
                      console.log("TOOLS_INFO SAVED!");
                      //return toolInfoCallBack("TOOLS_INFO SAVED!");
                  })
                  .catch(function (err) {
                      console.log("ERROR SAVING TOOLS_INFO");
                      //return callback(err);
                  });
              callbackAsync(null, 1);
          },
          function(callbackAsync) { //Save Authors
              authors.forEach(function(author) {
                  console.log("Saving AUTHOR(S):", author);
                  var type = 'update'; //'insert' or 'update' TODO: check if Author already exists in Database
                  (new Author).where("AUTHOR_ID", parseInt(author.AUTHOR_ID))
                      .save(author, {method: type})
                      .then(function () {
                          console.log("AUTHOR SAVED!")
                          //return authorsCallBack("AUTHOR SAVED!");
                      })
                      .catch(function (err) {
                          //console.error(err);
                          console.log("ERROR SAVING TO AUTHOR TABLE");
                          //return callback(err);
                      })
              });
              callbackAsync(null, 2);
          },
          function(error, results) {
              return callback("UPDATE COMPLETE!"); //Return whatever page or message
          }
      ]);

    //DOING UPDATES W/O USING ASYNC
    /*console.log(authors);
    console.log("Saving to TOOLS_INFO TABLE");
    var toolID = parseInt(toolInfo.AZID);
    var type = 'update'; //'insert' or 'update' TODO: check if toolID already exists in Database
    var exists = (new Tool).where('AZID', toolID);
      if(exists != null)
        type = 'update';
      else
        type = 'insert';

    delete toolInfo['AZID'];
    console.log('SAVING... ' + JSON.stringify(toolInfo));
    (new Tool).where('AZID', toolID)
        .save(toolInfo, { method : type})
        .then(function(tool) {
          console.log("TOOLS_INFO SAVED!");

            console.log("Saving to AUTHOR TABLE");

            authors.forEach(function(author) {
                console.log("Saving AUTHOR:", author);
                type = 'update'; //'insert' or 'update' TODO: check if Author already exists in Database
                (new Author).where("AUTHOR_ID", parseInt(author.AUTHOR_ID))
                    .save(author, {method: type})
                    .then(function (a) {
                        console.log("AUTHOR SAVED!")
                        //return callback(a.toJSON());
                    })
                    .catch(function (err) {
                        console.error(err);
                        console.log("ERROR SAVING TO AUTHOR TABLE")
                        //return callback(err);
                    })
            });
            //console.log("AUTHOR TABLE SAVED!")
          return callback(tool.toJSON());
        })
        .catch(function(err) {
          console.error(err);
          console.log("ERROR SAVING TOOLS_INFO");
          return callback(err);
        });*/
  }
};
