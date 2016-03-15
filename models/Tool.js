var async = require('async');
var logger = require("../config/logger");
var ToolUtils = require('../utility/toolUtils.js');
var ToolInfo = require('./mysql/tool.js');
var Resource = require('./mysql/resource.js');
var Tag = require('./mysql/tag.js');
var Domain = require('./mysql/domain.js');
var Agency = require('./mysql/agency.js');
var Language = require('./mysql/language.js');
var Platform = require('./mysql/platform.js');
var License = require('./mysql/license.js');
var Center = require('./mysql/center.js');
var Bookshelf = require('../config/bookshelf.js');


var M_tool = require('./mongo/toolMisc.js');
var M_author = require('./mongo/author.js');
var M_funding = require('./mongo/funding.js');
var M_link = require('./mongo/link.js');
var M_publication = require('./mongo/publication.js');
var M_version = require('./mongo/version.js');

var SavedTool = require('./mongo/savedTool.js');

function Tool() {
  var self = this;

  this.add = function(user, body, cb) {
    return self._add(self, user, body, cb);
  };

  this.update = function(id, body, cb) {
    return self._update(self, id, body, cb);
  };

  this.save = function(user, body, cb) {
    return self._save(self, user, body, cb);
  }

  this.show = function(id, cb){
    return self._show(self, id, cb);
  }

  this.showAll = function(cb){
    return self._showAll(self, cb);
  }


}


Tool.prototype._add = function(self, user, body, cb) {
  var obj = ToolUtils.unflatten(body);
  var json = ToolUtils.rest2mysql(obj);
  var toolInfo = json['toolInfo'];
  var res_types = json['res_types'];
  var domains = json['domains'];
  var tags = json['tags'];
  var links = json['links'];
  var langs = json['langs'];
  var platforms = json['platforms'];
  var versions = json['versions'];
  var license = json['license'];
  var agency = json['agency'];
  var funding = json['funding'];
  var institutions = json['institutions'];
  var centers = json['centers'];

  var m_tool = json['m_tool'];

  var resID = 0;

  var response = {};
  if (toolInfo.NAME == undefined || toolInfo.DESCRIPTION == undefined || (toolInfo.SOURCE_LINK == undefined && m_tool.links.length == 0)) {
    response.status = 'error';
    response.message = "Must enter the minimum fields: Resource Name, Description, and Source Code URL or at least 1 link."
    return cb(response);
  }

  var type = 'insert'; //'insert' or 'update'

  Bookshelf.transaction(function(transaction) {
    //DOING INSERTS USING ASYNC
    async.waterfall([
        function(callbackAsync) { //Save Tools_Info
          ToolInfo.forge()
            .save(toolInfo, {
              transacting: transaction,
              method: type
            })
            .then(function(tool) {
              logger.info("ready to commit %s!", toolInfo.NAME);
              return callbackAsync(null, {
                toolInfo: tool
              });
            })
            .catch(function() {
              logger.info("need to rollback %s!", toolInfo.NAME);
              return callbackAsync('Error with Tool Info', 0);
            });


        },
        function(toolData, callbackAsync) { //Save resource type
          var promises = [];
          for (var i = 0; i < res_types.length; i++) {
            res_types[i].AZID = toolData.toolInfo.attributes.AZID;
            promises.push(new Promise(function(resolve, reject) {
              Resource.forge()
                .save(res_types[i], {
                  transacting: transaction,
                  method: type
                })
                .then(function(res) {
                  logger.info("ready to commit %s!", res.attributes.RESOURCE_TYPE);
                  resolve(0);
                })
                .catch(function(err) {
                  logger.info("need to rollback resource type");
                  logger.debug(err);
                  resolve(-1);
                });
            }));
          }
          Promise.all(promises).then(function(values) {
            if (values.indexOf(-1) > -1)
              return callbackAsync('Error with resource type');
            else {
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save domain info
          var promises = [];
          for (var i = 0; i < domains.length; i++) {
            domains[i].AZID = toolData.toolInfo.attributes.AZID;
            promises.push(new Promise(function(resolve, reject) {
              Domain.forge()
                .save(domains[i], {
                  transacting: transaction,
                  method: type
                })
                .then(function(dom) {
                  logger.info("ready to commit %s!", dom.attributes.DOMAIN);
                  resolve(0);
                })
                .catch(function(err) {
                  logger.info("need to rollback domain info");
                  logger.debug(err);
                  resolve(-1);
                });
            }));
          }
          Promise.all(promises).then(function(values) {
            if (values.indexOf(-1) > -1)
              return callbackAsync('Error with domain info');
            else {
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save tags
          var promises = [];
          var insertTags = [];
          for (var i = 0; i < tags.length; i++) {
            promises.push(new Promise(function(resolve, reject) {
              async.waterfall([
                  function(cb) {
                    var currentTag = tags[i];
                    Tag.forge()
                      .query({
                        where: {
                          NAME: currentTag.NAME
                        }
                      })
                      .fetch()
                      .then(function(tag) {
                        if (tag == null) {
                          return cb(null, currentTag);
                        } else {
                          logger.info('Found existing tag: %s', tag.attributes.NAME);
                          insertTags.push(tag);
                          return cb('found');
                        }
                      })
                      .catch(function(err) {
                        logger.info('query tag error');
                        logger.debug(err);
                        return cb('error');
                      })
                  },
                  function(newtag, cb) {
                    Tag.forge()
                      .save(newtag, {
                        transacting: transaction,
                        method: type
                      })
                      .then(function(tag) {
                        logger.info("ready to commit %s!", tag.attributes.NAME);
                        insertTags.push(tag);
                        cb(null);
                      })
                      .catch(function(err) {
                        logger.info("need to rollback tags");
                        logger.debug(err);
                        cb('error');
                      });
                  }
                ],
                function(error) {
                  if (error == null || error == 'found') {
                    resolve(0);
                  } else {
                    resolve(-1);
                  }
                });

            }));
          }
          Promise.all(promises).then(function(values) {
            if (values.indexOf(-1) > -1)
              return callbackAsync('Error with tags');
            else {
              toolData.tags = insertTags;
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save languages
          var promises = [];
          var insertLangs = [];
          for (var i = 0; i < langs.length; i++) {
            promises.push(new Promise(function(resolve, reject) { //TODO: save only name
              async.waterfall([
                  function(cb) {
                    var currentLang = langs[i];
                    Language.forge()
                      .query({
                        where: {
                          NAME: currentLang.NAME
                        }
                      })
                      .fetch()
                      .then(function(lang) {
                        if (lang == null) {
                          return cb(null, currentLang);
                        } else {
                          logger.info('Found existing language: %s', lang.attributes.NAME);
                          insertLangs.push(lang);
                          return cb('found');
                        }
                      })
                      .catch(function(err) {
                        logger.info('query language error');
                        logger.debug(err);
                        return cb('error');
                      })
                  },
                  function(newlang, cb) { // TODO: remove
                    Language.forge()
                      .save(newlang, {
                        transacting: transaction,
                        method: type
                      })
                      .then(function(lang) {
                        logger.info("ready to commit %s!", lang.attributes.NAME);
                        insertLangs.push(lang);
                        cb(null);
                      })
                      .catch(function(err) {
                        logger.info("need to rollback languages");
                        logger.debug(err);
                        cb('error');
                      });
                  }
                ],
                function(error) {
                  if (error == null || error == 'found') {
                    resolve(0);
                  } else {
                    resolve(-1);
                  }
                });

            }));
          }
          Promise.all(promises).then(function(values) {
            if (values.indexOf(-1) > -1)
              return callbackAsync('Error with languages');
            else {
              toolData.langs = insertLangs;
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save platforms
          var promises = [];
          var insertPlatforms = [];
          for (var i = 0; i < platforms.length; i++) {
            promises.push(new Promise(function(resolve, reject) {

              var currentPlatform = platforms[i];
              Platform.forge()
                .query({
                  where: {
                    NAME: currentPlatform.NAME
                  }
                })
                .fetch()
                .then(function(platform) {
                  if (platform == null) {
                    return resolve(-1);
                  } else {
                    logger.info('Found existing platform: %s', platform.attributes.NAME);
                    insertPlatforms.push(platform);
                    return resolve(0);
                  }
                })
                .catch(function(err) {
                  logger.info('query platform error');
                  logger.debug(err);
                  return resolve(-1);
                })

            }));
          }
          Promise.all(promises).then(function(values) {
            if (values.indexOf(-1) > -1)
              return callbackAsync('Error with platforms');
            else {
              toolData.platforms = insertPlatforms;
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save license
          var promises = [];
          for (var i = 0; i < license.length; i++) {
            var newLicense = license[i];
            newLicense.AZID = toolData.toolInfo.attributes.AZID;
            promises.push(new Promise(function(resolve, reject) {
              License.forge()
                .save(newLicense, {
                  transacting: transaction,
                  method: type
                })
                .then(function(lic) {
                  logger.info("ready to commit %s!" + lic.attributes.LICENSE_TYPE);
                  return resolve(0);
                })
                .catch(function(err) {
                  logger.info("need to rollback license");
                  logger.debug(err);
                  return resolve(-1);
                });

            }));
          }
          Promise.all(promises).then(function(values) {
            if (values.indexOf(-1) > -1)
              return callbackAsync('Error with license');
            else {
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save bd2k centers
          var promises = [];
          for (var i = 0; i < centers.length; i++) {
            var newCenter = centers[i];
            newCenter.AZID = toolData.toolInfo.attributes.AZID;
            promises.push(new Promise(function(resolve, reject) {
              Center.forge()
                .save(newCenter, {
                  transacting: transaction,
                  method: type
                })
                .then(function(c) {
                  logger.info("ready to commit %s!" + c.attributes.BD2K_CENTER);
                  return resolve(0);
                })
                .catch(function(err) {
                  logger.info("need to rollback center");
                  logger.debug(err);
                  return resolve(-1);
                });

            }));
          }
          Promise.all(promises).then(function(values) {
            if (values.indexOf(-1) > -1)
              return callbackAsync('Error with center');
            else {
              return callbackAsync(null, toolData);
            }
          });
        }

      ],
      function(error, toolData) {

        if (error != null) {
          logger.info('Error with inserting: %s', error);
          logger.info("rolling back %s!", toolInfo.NAME);
          transaction.rollback();
          logger.info('Finished rollback');
          response.status = 'error';
          response.message = "Error inserting metadata into database";
          return cb(response);
        } else {
          resID = parseInt(toolData.toolInfo.attributes.AZID);
          logger.info("Committing Tool " + toolData.toolInfo.attributes.NAME + "!");
          transaction.commit(toolData.toolInfo);

          if (json['savedID'] != undefined && json['savedID'] != "") {
            SavedTool.remove({
              _id: json['savedID']
            }, function(err) {
              if (err) {
                logger.debug(err);
              }
            });
          }

          for (var i = 0; i < toolData.tags.length; i++) {
            logger.debug("Committing " + tags[i].NAME + "!");
            logger.debug('attach tags:', toolData.tags[i]);
            toolData.toolInfo.tags().attach(toolData.tags[i]);
          }
          for (var i = 0; i < toolData.langs.length; i++) {
            logger.debug("Committing " + langs[i].NAME + "!");
            logger.debug('attach languages:', toolData.langs[i]);
            toolData.toolInfo.languages().attach(toolData.langs[i]);
          }

          for (var i = 0; i < toolData.platforms.length; i++) {
            logger.debug("Committing " + platforms[i].NAME + "!");
            logger.debug('attach platforms:', toolData.platforms[i]);
            toolData.toolInfo.platform().attach(toolData.platforms[i]);
          }


          if (user != undefined) {
            logger.debug('attach user:', user);
            toolData.toolInfo.users().attach(user);
          }

          m_tool.azid = toolData.toolInfo.attributes.AZID;
          for (var i = 0; i < funding.length; i++) {

            var m_fund = new M_funding;
            if (funding[i].funding_agency != undefined)
              m_fund.funding_agency = funding[i].funding_agency;
            if (funding[i].funding_grant != undefined)
              m_fund.funding_grant = funding[i].funding_grant;
            if (funding[i].missing != undefined)
              m_fund.missing = funding[i].missing;
            if (funding[i].new_agency != undefined)
              m_fund.new_agency = funding[i].new_agency;
            m_tool.funding.push(m_fund);
          }

          logger.debug('attach institutions');
          toolData.toolInfo.institutions().attach(institutions);

          m_tool.save(function(err) {
            if (err) {
              logger.info('mongo error');
              logger.debug(err);
            }
            logger.debug('mongo success');
          });


        }
      }
    );
  }).then(function() {
    logger.info("%s was successfully inserted!", toolInfo.NAME);
    response.status = 'success';
    response.message = "Successfully inserted " + toolInfo.NAME;
    response.id = resID;
    return cb(response);
  }).catch(function(err) {
    console.log('error');
    logger.debug(err);
  });
};

Tool.prototype._update = function(self, id, body, cb){

  var obj = ToolUtils.unflatten(body);
  var json = ToolUtils.rest2mysql(obj['new']);




  var type = 'update'; //'insert' or 'update'
  Bookshelf.transaction(function (transaction) {
    //DOING INSERTS USING ASYNC
    async.waterfall([
        function(callbackAsync) { //update Tools_Info
          ToolInfo.forge()
            .save(json['toolInfo'], {transacting: transaction, method: type})
            .then(function(tool){
              logger.info("ready to commit %s!", json['toolInfo']['AZID']);
              tool.institutions().detach();
              tool.tags().detach();
              tool.languages().detach();
              tool.platform().detach();
              return callbackAsync(null, {toolInfo: tool});
            })
            .catch(function(err){
              logger.info("need to rollback %s!", json['toolInfo']['AZID']);
              logger.debug(err);
              return callbackAsync('Error with Tool Info', null);
            });
        },
        function(toolData, callbackAsync) { //delete resource types
          Resource.forge()
            .where({AZID: toolData['toolInfo']['attributes']['AZID']})
            .fetchAll({transacting: transaction})
            .then(function(res){
              var promises = [];
              res.forEach(function(r){
                promises.push(new Promise(function(resolve, reject){
                  Resource.forge()
                    .where({TR_ID: r.attributes.TR_ID})
                    .destroy({transacting: transaction})
                    .then(function(delRes){
                      logger.info('deleted resource type %s!', delRes.attributes.RESOURCE_TYPE);
                      resolve(0);
                    })
                    .catch(function(err){
                      logger.info('error deleting resource type');
                      logger.debug(err);
                      resolve(-1);
                    });
                  }));
              });
              Promise.all(promises).then(function(values){
                logger.debug(values);
                if(values.indexOf(-1)>-1)
                  return callbackAsync('Error with deleting resource type');
                else{
                  return callbackAsync(null, toolData);
                }
              });
            })
            .catch(function(err){
              return callbackAsync('resource query error', null);
            });

        },
        function(toolData, callbackAsync) { //Save resource type
          if(json['res_types']==undefined || json['res_types'].length==0){
            return callbackAsync(null, toolData);
          }
          else{
            var promises = [];
            for(var i = 0; i<json['res_types'].length; i++){
              json['res_types'][i].AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                Resource.forge()
                  .save(json['res_types'][i], {transacting: transaction, method: 'insert'})
                  .then(function(res){
                    logger.info("ready to commit %s!", res.attributes.RESOURCE_TYPE);
                    resolve(0);
                  })
                  .catch(function(err){
                    logger.info("need to rollback resource type");
                    logger.debug(err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              logger.debug(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with resource type');
              else{
                return callbackAsync(null, toolData);
              }
            });
          }
        },
        function(toolData, callbackAsync) { //delete domain
          Domain.forge()
            .where({AZID: toolData['toolInfo']['attributes']['AZID']})
            .fetchAll({transacting: transaction})
            .then(function(dom){
              var promises = [];
              dom.forEach(function(d){
                promises.push(new Promise(function(resolve, reject){
                  Domain.forge()
                    .where({TD_ID: d.attributes.TD_ID})
                    .destroy({transacting: transaction})
                    .then(function(delDom){
                      logger.info('deleted domain type %s', delDom.attributes.DOMAIN);
                      resolve(0);
                    })
                    .catch(function(err){
                      logger.info('error deleting domain type');
                      logger.debug(err);
                      resolve(-1);
                    });
                  }));
              });
              Promise.all(promises).then(function(values){
                logger.debug(values);
                if(values.indexOf(-1)>-1)
                  return callbackAsync('Error with deleting domain');
                else{
                  return callbackAsync(null, toolData);
                }
              });
            })
            .catch(function(err){
              return callbackAsync('domain query error', null);
            });

        },
        function(toolData, callbackAsync) { //Save domain
          var promises = [];
          if(json['domains']==undefined || json['domains'].length==0){
            return callbackAsync(null, toolData);
          }
          else{
            for(var i = 0; i<json['domains'].length; i++){
              json['domains'][i].AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                Domain.forge()
                  .save(json['domains'][i], {transacting: transaction, method: 'insert'})
                  .then(function(dom){
                    logger.info("ready to commit %s!", dom.attributes.DOMAIN);
                    resolve(0);
                  })
                  .catch(function(err){
                    logger.info("need to rollback domain");
                    logger.debug(err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              logger.debug(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with domain');
              else{
                return callbackAsync(null, toolData);
              }
            });
          }
        },
        function(toolData, callbackAsync) { //Save tags
          var promises = [];
          var insertTags = [];
          for(var i = 0; i<json['tags'].length; i++){
            promises.push(new Promise(function(resolve, reject){
              async.waterfall([
                function(cb){
                  var currentTag = json['tags'][i];
                  Tag.forge()
                    .query({where: {NAME: currentTag.NAME}})
                    .fetch()
                    .then(function(tag){
                      if(tag==null){
                        return cb(null, currentTag);
                      }
                      else{
                        logger.info('Found existing tag: %s', tag.attributes.NAME);
                        insertTags.push(tag);
                        return cb('found');
                      }
                    })
                    .catch(function(err){
                      logger.info('query tag error');
                      logger.debug(err);
                      return cb('error');
                    })
                },
                function(newtag, cb){
                  Tag.forge()
                    .save(newtag, {transacting: transaction, method: "insert"})
                    .then(function(tag){
                      logger.info("ready to commit %s!", tag.attributes.NAME);
                      insertTags.push(tag);
                      cb(null);
                    })
                    .catch(function(err){
                      logger.info("need to rollback tags");
                      logger.debug(err);
                      cb('error');
                    });
                }
              ],
              function(error){
                if(error==null || error=='found'){
                  resolve(0);
                }
                else{
                  resolve(-1);
                }
              });

            }));
          }
          Promise.all(promises).then(function(values){
            if(values.indexOf(-1)>-1)
              return callbackAsync('Error with tags');
            else{
              toolData.tags = insertTags;
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save platform
          var promises = [];
          var plat_ids = [];
          for(var i = 0; i<json['platforms'].length; i++){
            promises.push(new Promise(function(resolve, reject){
              Platform.forge()
                .query({where: {NAME: json['platforms'][i]['NAME']}})
                .fetch()
                .then(function(plat){
                  plat_ids.push(plat.attributes.PLATFORM_ID);
                  logger.info("ready to commit platform %s!", plat.attributes.PLATFORM_ID);
                  resolve(0);
                })
                .catch(function(err){
                  logger.info("need to rollback platform type");
                  logger.debug(err);
                  resolve(-1);
                });
            }));
          }
          Promise.all(promises).then(function(values){
            logger.debug(values);
            if(values.indexOf(-1)>-1)
              return callbackAsync('Error with platform');
            else{
              toolData.platforms = plat_ids;
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //Save languages
          var promises = [];
          var lang_ids = [];
          for(var i = 0; i<json['langs'].length; i++){
            promises.push(new Promise(function(resolve, reject){
              Language.forge()
                .query({where: {NAME: json['langs'][i]['NAME']}})
                .fetch()
                .then(function(lang){
                  lang_ids.push(lang.attributes.LANG_ID);
                  logger.info("ready to commit language %s!", lang.attributes.LANG_ID);
                  resolve(0);
                })
                .catch(function(err){
                  logger.info("need to rollback language");
                  logger.debug(err);
                  resolve(-1);
                });
            }));
          }
          Promise.all(promises).then(function(values){
            logger.debug(values);
            if(values.indexOf(-1)>-1)
              return callbackAsync('Error with languages');
            else{
              toolData.languages = lang_ids;
              return callbackAsync(null, toolData);
            }
          });
        },
        function(toolData, callbackAsync) { //delete license
          License.forge()
            .where({AZID: toolData['toolInfo']['attributes']['AZID']})
            .fetchAll({transacting: transaction})
            .then(function(lic){
              var promises = [];
              lic.forEach(function(l){
                promises.push(new Promise(function(resolve, reject){
                  License.forge()
                    .where({TL_ID: l.attributes.TL_ID})
                    .destroy({transacting: transaction})
                    .then(function(delLic){
                      logger.info('deleted license %s', delLic.attributes.LICENSE_TYPE);
                      resolve(0);
                    })
                    .catch(function(err){
                      logger.info('error deleting license');
                      logger.debug(err);
                      resolve(-1);
                    });
                  }));
              });
              Promise.all(promises).then(function(values){
                logger.debug(values);
                if(values.indexOf(-1)>-1)
                  return callbackAsync('Error with deleting license');
                else{
                  return callbackAsync(null, toolData);
                }
              });
            })
            .catch(function(err){
              return callbackAsync('center query error', null);
            });

        },
        function(toolData, callbackAsync) { //Save license
          var promises = [];
          if(json['license']==undefined || json['license'].length==0){
            return callbackAsync(null, toolData);
          }
          else{
            for(var i = 0; i<json['license'].length; i++){
              json['license'][i].AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                License.forge()
                  .save(json['license'][i], {transacting: transaction, method: 'insert'})
                  .then(function(lic){
                    logger.info("ready to commit %s!", lic.attributes.LICENSE_TYPE);
                    resolve(0);
                  })
                  .catch(function(err){
                    logger.info("need to rollback license");
                    logger.debug(err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              logger.debug(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with license');
              else{
                return callbackAsync(null, toolData);
              }
            });
          }
        },
        function(toolData, callbackAsync) { //delete centers
          Center.forge()
            .where({AZID: toolData['toolInfo']['attributes']['AZID']})
            .fetchAll({transacting: transaction})
            .then(function(cen){
              var promises = [];
              cen.forEach(function(c){
                promises.push(new Promise(function(resolve, reject){
                  Center.forge()
                    .where({TB_ID: c.attributes.TB_ID})
                    .destroy({transacting: transaction})
                    .then(function(delCen){
                      logger.info('deleted center %s', delCen.attributes.BD2K_CENTER);
                      resolve(0);
                    })
                    .catch(function(err){
                      logger.info('error deleting center');
                      logger.debug(err);
                      resolve(-1);
                    });
                  }));
              });
              Promise.all(promises).then(function(values){
                logger.debug(values);
                if(values.indexOf(-1)>-1)
                  return callbackAsync('Error with deleting center');
                else{
                  return callbackAsync(null, toolData);
                }
              });
            })
            .catch(function(err){
              return callbackAsync('center query error', null);
            });

        },
        function(toolData, callbackAsync) { //Save center
          var promises = [];
          if(json['centers']==undefined || json['centers'].length==0){
            return callbackAsync(null, toolData);
          }
          else{
            for(var i = 0; i<json['centers'].length; i++){
              json['centers'][i].AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                Center.forge()
                  .save(json['centers'][i], {transacting: transaction, method: 'insert'})
                  .then(function(cen){
                    logger.info("ready to commit %s!", cen.attributes.BD2K_CENTER);
                    resolve(0);
                  })
                  .catch(function(err){
                    logger.info("need to rollback center");
                    logger.debug(err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              logger.debug(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with center');
              else{
                return callbackAsync(null, toolData);
              }
            });
          }
        }
      ],
      function(error, toolData){
        if(error!=null){
          logger.info('Error updating: %s', error);
          transaction.rollback();
          cb({
            status  : 'error',
            message : id+' not updated'
          });
        }
        else{
          transaction.commit(toolData.toolInfo);
          toolData.toolInfo.institutions().attach(json['institutions']);
          toolData.toolInfo.platform().attach(toolData.platforms);
          toolData.toolInfo.languages().attach(toolData.languages);
          toolData.toolInfo.tags().attach(toolData.tags);
        }
      }
    );
  }).then(function(){
    var response = {};
    M_tool.findOne({azid: id}, function(err, misc){
      if (err){
        cb({
          status  : 'error',
          message   : id+' not found in mongo'
        });
      }
      if(obj['new']['authors']!=undefined){
        misc.authors = obj['new']['authors']['authors'];
        misc.maintainers = obj['new']['authors']['maintainers'];
      }
      if(misc==undefined || misc ==null){
        misc = new M_tool;
      }
      misc.publications = [];
      if(obj['new']['publication']!=undefined){
        if(obj['new']['publication']['pub_primary_doi']){
            var m_pub = new M_publication;
            m_pub.pub_doi = obj['new']['publication']['pub_primary_doi'];
            m_pub.primary = true;
            misc.publications.push(m_pub);
        }
        if(obj['new']['publication']['pub_dois']!=undefined){
          for(var i = 0; i<obj['new']['publication']['pub_dois'].length; i++){
            var m_pub = new M_publication;
            m_pub.pub_doi = obj['new']['publication']['pub_dois'][i]['pub_doi'];
            misc.publications.push(m_pub);
          }
        }
      }
      if(obj['new']['links']!=undefined)
        misc.links = obj['new']['links']['links'];

      misc.versions = [];
      if(obj['new']['version']!=undefined){
        var m_ver = new M_version;
        m_ver.version_number = obj['new']['version']['latest_version'];
        m_ver.version_description = obj['new']['version']['latest_version_desc'];
        m_ver.version_date = new Date(obj['new']['version']['latest_version_date']);
        m_ver.latest = true;
        misc.versions.push(m_ver);

        if(obj['new']['version']['prev_versions']!=undefined){
          for(var i = 0; i<obj['new']['version']['prev_versions'].length; i++){
            var prev_ver = new M_version;
            prev_ver.version_number = obj['new']['version']['prev_versions'][i]['version_number'];
            prev_ver.version_description = obj['new']['version']['prev_versions'][i]['version_description'];
            prev_ver.version_date = new Date(obj['new']['version']['prev_versions'][i]['version_date']);
            misc.versions.push(prev_ver);
          }

        }

      }
      if(obj['new']['funding']!=undefined){
        misc.funding = obj['new']['funding']['funding'];
      }
      misc.missing_inst = json['m_tool']['missing_inst'];


      misc.save(function (err) {
        if (err){
          return cb({
            status   : 'error',
            message   : id+' not saved in mongo'
          });
        }

        logger.info("%s was successfully updated!", json['toolInfo']['AZID']);
        response.status = 'success';
        response.message = "Successfully updated resource "+json['toolInfo']['AZID'];
        response.id = json['toolInfo']['AZID'];
        return cb(response);
      });
    });
  }).catch(function(err){
    logger.debug(err);
  });;

};

Tool.prototype._save = function(self, user, json, cb){
  var tool = json;
  logger.debug(tool);
  if(tool['savedID']!=""){
    SavedTool.update({_id: tool['savedID']}, {$set: {tool:util.unflatten(tool), date: Date.now()}}, function(err){
      if(err){
        logger.info('save error');
        logger.debug(err);
        cb({
          status: 'error',
          message: 'Did not save'
        });
      }else{
        cb({
          status: 'success',
          message: 'Saved tool'
        });
      }
    })
  }
  else{
    var saveTool = new SavedTool({ tool: ToolUtils.unflatten(tool) });
    saveTool.user = user.attributes.EMAIL;
    saveTool.save(function (err, t) {
      if(err){
        logger.info('mongo error');
        logger.debug(err);
        cb({
          status: 'error',
          message: 'Error saving tool'
        });
      }else{
        logger.debug('mongo success');
        cb({
          status: 'success',
          message: 'Saved tool',
          id: t['_id']
        });
      }
    });
  }
};

Tool.prototype._show = function(self, id, cb){
  ToolInfo.forge()
    .where({AZID: id})
    .fetchAll({withRelated: ['domains', 'license', 'platform', 'tags', 'resource_types', 'languages', 'institutions', 'centers']})
    .then(function(thisTool){
      M_tool.findOne({azid: id}, function(err, misc){
        if (err || thisTool.length==0){
          var response = {
            status  : 'error',
            error   : id+' not found'
          }
          return cb(response);
        }

        var returnTool = thisTool.toJSON()[0];

        //console.log('tool',thisTool.toJSON());

        if(misc!=undefined && misc!=null){
          //console.log('misc', misc);

          returnTool.authors = misc.authors;
          returnTool.maintainers = misc.maintainers;
          returnTool.links = misc.links;
          returnTool.funding = misc.funding;
          returnTool.version = misc.versions;
          returnTool.publications = misc.publications;

          misc.missing_inst.forEach(function(inst){
            returnTool.institutions.push(inst);
          });
        }
        var result = ToolUtils.mysql2rest(returnTool);
        return cb(result);
      });
    })
    .catch(function(err){
      console.log(err);
      var response = {
        status  : 'error',
        error   : JSON.stringify(err)
      }
      return cb(response);
    });
};

Tool.prototype._showAll = function(self, cb){
  ToolInfo.forge()
    .query(function (qb) {
      qb.orderBy('AZID');
    })
    .fetchAll({withRelated: [ 'domains', 'license', 'platform', 'tags', 'resource_types', 'languages', 'institutions', 'centers']})
    .then(function(i){
      return cb(i);
    })
    .catch(function(err){
      console.log(err);
      var response = {
        status  : 'error',
        error   : JSON.stringify(err)
      }
      return cb(response);
    });
};

module.exports = Tool;
