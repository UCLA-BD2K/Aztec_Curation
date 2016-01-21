var async = require('async');
var util = require('./utilities/util.js');
var Tool = require('../models/mysql/tool.js');
var Author = require('../models/mysql/author.js');
var Resource = require('../models/mysql/resource.js');
var Tag = require('../models/mysql/tag.js');
var Link = require('../models/mysql/relatedLinks.js');
var Domain = require('../models/mysql/domain.js');
var Agency = require('../models/mysql/agency.js');
var Language = require('../models/mysql/language.js');
var Platform = require('../models/mysql/platform.js');
var Version = require('../models/mysql/version.js');
var License = require('../models/mysql/license.js');
var Agency = require('../models/mysql/agency.js');
var Funding = require('../models/mysql/funding.js');
var Bookshelf = require('../config/bookshelf.js');
var logger = require("../config/logger");

var ToolMisc = require('../models/mongo/toolMisc.js');

var changesets = require('diff-json');
var convert = require('./utilities/convert.js');


module.exports = {
  putEdit: function(req, res, next){
    var id = req.params.id;

    var diffs = getDiffs(req.body);
    var message = JSON.stringify(diffs);
    logger.debug(message);

    var obj = util.unflatten(req.body);
    var json = convert.convert2mysql(obj['new']);




    var type = 'update'; //'insert' or 'update'
    Bookshelf.transaction(function (transaction) {
      //DOING INSERTS USING ASYNC
      async.waterfall([
          function(callbackAsync) { //update Tools_Info
            Tool.forge()
              .save(json['toolInfo'], {transacting: transaction, method: type})
              .then(function(tool){
                logger.info("ready to commit %s!", json['toolInfo']['AZID']);
                tool.institutions().detach();
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
                return callbackAsync('domain query error', null);
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
          }
        ],
        function(error, toolData){
          if(error!=null){
            logger.info('Error updating: %s', error);
            transaction.rollback();
            res.send({
              success  : 'error',
              message   : id+' not updated'
            });
          }
          else{
            transaction.commit(toolData.toolInfo);
            toolData.toolInfo.institutions().attach(json['institutions']);
            toolData.toolInfo.platform().attach(toolData.platforms);
            toolData.toolInfo.languages().attach(toolData.languages);
          }
        }
      );
    }).then(function(){
      var response = {};
      ToolMisc.findOne({azid: id}, function(err, misc){
        if (err){
          res.send({
            success  : 'false',
            message   : id+' not found in mongo'
          });
        }
        if(obj['new']['authors']!=undefined){
          misc.authors = obj['new']['authors']['authors'];
          misc.maintainers = obj['new']['authors']['maintainers'];
        }
        if(obj['new']['publication']!=undefined)
          misc.publication = obj['new']['publication'];
        if(obj['new']['links']!=undefined)
          misc.links = obj['new']['links']['links'];
        if(obj['new']['autversionhors']!=undefined)
          misc.version = obj['new']['version'];
        if(obj['new']['funding']!=undefined)
          misc.funding = obj['new']['funding']['funding'];
        misc.missing_inst = json['m_tool']['missing_inst'];

        misc.save(function (err) {
          if (err){
            return res.send({
              success  : 'error',
              message   : id+' not saved in mongo'
            });
          }

          logger.info("%s was successfully updated!", json['toolInfo']['AZID']);
          response.success = true;
          response.message = "Successfully updated resource "+json['toolInfo']['AZID'];
          return res.send(response);
        });
      });
    }).catch(function(err){
      logger.debug(err);
    });;

  }
};

function getDiffs(obj){
  var json = util.unflatten(obj);

  if(json['new']['basic']!=undefined){
    json['new']['basic']['res_types'] = util.removeHash(json['new']['basic']['res_types']);
    json['new']['basic']['bio_domains'] = util.removeHash(json['new']['basic']['bio_domains']);
  }

  if(json['new']['authors']!=undefined)
    json['new']['authors']['authors'] = util.removeHash(json['new']['authors']['authors']);

  if(json['new']['authors']!=undefined)
    json['new']['authors']['institution'] = util.removeHash(json['new']['authors']['institution']);

  if(json['new']['publication']!=undefined)
    json['new']['publication']['pub_dois'] = util.removeHash(json['new']['publication']['pub_dois']);

  if(json['new']['links']!=undefined)
    json['new']['links']['links'] = util.removeHash(json['new']['links']['links']);

  if(json['new']['dev']!=undefined)
    json['new']['dev']['dev_lang'] = util.removeHash(json['new']['dev']['dev_lang']);

  if(json['new']['dev']!=undefined)
    json['new']['dev']['dev_platform'] = util.removeHash(json['new']['dev']['dev_platform']);

  if(json['new']['version']!=undefined)
    json['new']['version']['prev_versions'] = util.removeHash(json['new']['version']['prev_versions']);

  if(json['new']['license']!=undefined)
    json['new']['license']['licenses'] = util.removeHash(json['new']['license']['licenses']);

  if(json['new']['funding']!=undefined)
    json['new']['funding']['funding'] = util.removeHash(json['new']['funding']['funding']);

  return changesets.diff(json['orig'], json['new']);
}
