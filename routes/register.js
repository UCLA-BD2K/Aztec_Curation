var async = require('async');
var logger = require("../config/logger");
var util = require('./utilities/util.js');
var Tool = require('../models/mysql/tool.js');
var Resource = require('../models/mysql/resource.js');
var Tag = require('../models/mysql/tag.js');
var Domain = require('../models/mysql/domain.js');
var Agency = require('../models/mysql/agency.js');
var Language = require('../models/mysql/language.js');
var Platform = require('../models/mysql/platform.js');
var License = require('../models/mysql/license.js');
var Center = require('../models/mysql/center.js');
var Bookshelf = require('../config/bookshelf.js');
var convert = require('./utilities/convert');


var M_tool = require('../models/mongo/toolMisc.js');
var M_author = require('../models/mongo/author.js');
var M_funding = require('../models/mongo/funding.js');
var M_link = require('../models/mongo/link.js');
var M_publication = require('../models/mongo/publication.js');
var M_version = require('../models/mongo/version.js');




function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
};

function toMysqlDate(date){
  return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth()) + "-" + twoDigits(date.getUTCDate());
};


module.exports = {
  saveTool: function(req, res, next) {


    var obj = util.unflatten(req.body);
    var json = convert.convert2mysql(obj);
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

    logger.debug(obj);
    var resID = 0;



    // console.log('tool info', JSON.stringify(toolInfo));
    // console.log('author:',JSON.stringify(authors));
    // console.log('resource types', JSON.stringify(res_types));
    // console.log('domains', JSON.stringify(domains));
    // console.log('tags', JSON.stringify(tags));
    // console.log('links', JSON.stringify(links));
    // console.log('languages', JSON.stringify(langs));
    // console.log('platforms', JSON.stringify(platforms));
    // console.log('version', JSON.stringify(versions));
    // console.log('license', JSON.stringify(license));
    // console.log('funding', JSON.stringify(agency), JSON.stringify(funding));
    // console.log('mongo tool', JSON.stringify(m_tool));


    var response = {};
    if(toolInfo.NAME==undefined || toolInfo.DESCRIPTION==undefined || (toolInfo.SOURCE_LINK==undefined && links.length==0)){
      response.status = 'error';
      response.message = "Must enter the minimum fields: Resource Name, Description, and Source Code URL or at least 1 link."
      return res.send(response);
    }

    // var id = parseInt(toolInfo.AZID);
    // delete toolInfo['AZID'];
    //toolInfo.AZID=1;
    //authors[0].AUTHOR_ID = 1;
    var type = 'insert'; //'insert' or 'update'

    Bookshelf.transaction(function (transaction) {
      //DOING INSERTS USING ASYNC
      async.waterfall([
          function(callbackAsync) { //Save Tools_Info
                Tool.forge()
                  .save(toolInfo, {transacting: transaction, method: type})
                  .then(function(tool){
                    logger.info("ready to commit %s!", toolInfo.NAME);
                    return callbackAsync(null, {toolInfo: tool});
                  })
                  .catch(function(){
                    logger.info("need to rollback %s!", toolInfo.NAME);
                    return callbackAsync('Error with Tool Info', 0);
                  });


          },
          function(toolData, callbackAsync) { //Save resource type
            var promises = [];
            for(var i = 0; i<res_types.length; i++){
              res_types[i].AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                Resource.forge()
                  .save(res_types[i], {transacting: transaction, method: type})
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
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with resource type');
              else{
                return callbackAsync(null, toolData);
              }
            });
          },
          function(toolData, callbackAsync) { //Save domain info
            var promises = [];
            for(var i = 0; i<domains.length; i++){
              domains[i].AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                Domain.forge()
                  .save(domains[i], {transacting: transaction, method: type})
                  .then(function(dom){
                    logger.info("ready to commit %s!", dom.attributes.DOMAIN);
                    resolve(0);
                  })
                  .catch(function(err){
                    logger.info("need to rollback domain info");
                    logger.debug(err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with domain info');
              else{
                return callbackAsync(null, toolData);
              }
            });
          },
          function(toolData, callbackAsync) { //Save tags
            var promises = [];
            var insertTags = [];
            for(var i = 0; i<tags.length; i++){
              promises.push(new Promise(function(resolve, reject){
                async.waterfall([
                  function(cb){
                    var currentTag = tags[i];
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
                      .save(newtag, {transacting: transaction, method: type})
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
          function(toolData, callbackAsync) { //Save languages
            var promises = [];
            var insertLangs = [];
            for(var i = 0; i<langs.length; i++){
              promises.push(new Promise(function(resolve, reject){
                async.waterfall([
                  function(cb){
                    var currentLang = langs[i];
                    Language.forge()
                      .query({where: {NAME: currentLang.NAME}})
                      .fetch()
                      .then(function(lang){
                        if(lang==null){
                          return cb(null, currentLang);
                        }
                        else{
                          logger.info('Found existing language: %s', lang.attributes.NAME);
                          insertLangs.push(lang);
                          return cb('found');
                        }
                      })
                      .catch(function(err){
                        logger.info('query language error');
                        logger.debug(err);
                        return cb('error');
                      })
                  },
                  function(newlang, cb){
                    Language.forge()
                      .save(newlang, {transacting: transaction, method: type})
                      .then(function(lang){
                        logger.info("ready to commit %s!", lang.attributes.NAME);
                        insertLangs.push(lang);
                        cb(null);
                      })
                      .catch(function(err){
                        logger.info("need to rollback languages");
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
                return callbackAsync('Error with languages');
              else{
                toolData.langs = insertLangs;
                return callbackAsync(null, toolData);
              }
            });
          },
          function(toolData, callbackAsync) { //Save platforms
            var promises = [];
            var insertPlatforms = [];
            for(var i = 0; i<platforms.length; i++){
              promises.push(new Promise(function(resolve, reject){

                  var currentPlatform = platforms[i];
                  Platform.forge()
                    .query({where: {NAME: currentPlatform.NAME}})
                    .fetch()
                    .then(function(platform){
                      if(platform==null){
                        return resolve(-1);
                      }
                      else{
                        logger.info('Found existing platform: %s', platform.attributes.NAME);
                        insertPlatforms.push(platform);
                        return resolve(0);
                      }
                    })
                    .catch(function(err){
                      logger.info('query platform error');
                      logger.debug(err);
                      return resolve(-1);
                    })

              }));
            }
            Promise.all(promises).then(function(values){
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with platforms');
              else{
                toolData.platforms = insertPlatforms;
                return callbackAsync(null, toolData);
              }
            });
          },
          function(toolData, callbackAsync) { //Save license
            var promises = [];
            for(var i = 0; i<license.length; i++){
              var newLicense = license[i];
              newLicense.AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                License.forge()
                  .save(newLicense, {transacting: transaction, method: type})
                  .then(function(lic){
                    logger.info("ready to commit %s!"+lic.attributes.LICENSE_TYPE);
                    return resolve(0);
                  })
                  .catch(function(err){
                    logger.info("need to rollback license");
                    logger.debug(err);
                    return resolve(-1);
                  });

              }));
            }
            Promise.all(promises).then(function(values){
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with license');
              else{
                return callbackAsync(null, toolData);
              }
            });
          },
          function(toolData, callbackAsync) { //Save agency
            var promises = [];
            var insertAgency = [];
            for(var i = 0; i<agency.length; i++){
              promises.push(new Promise(function(resolve, reject){
                async.waterfall([
                  function(cb){
                    var currentAgency = agency[i];
                    Agency.forge()
                      .query({where: {NAME: currentAgency.NAME}})
                      .fetch()
                      .then(function(a){
                        if(a==null){
                          return cb(null, false, currentAgency);
                        }
                        else{
                          logger.info('Found existing Agency: %s', a.attributes.NAME);
                          insertAgency.push(a);
                          return cb(null, true, a);
                        }
                      })
                      .catch(function(err){
                        logger.info('query agency error');
                        logger.debug(err);
                        return cb('error');
                      })
                  },
                  function(foundAgency, newAgency, cb){
                    if(foundAgency){
                      return cb(null, newAgency);
                    }
                    Agency.forge()
                      .save(newAgency, {transacting: transaction, method: type})
                      .then(function(a){
                        logger.info("ready to commit %s!", a.attributes.NAME);
                        insertAgency.push(a);
                        return cb(null, a);
                      })
                      .catch(function(err){
                        logger.info("need to rollback agency");
                        logger.debug(err);
                        return cb('error');
                      });
                  },
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
                return callbackAsync('Error with agency');
              else{
                toolData.agency = insertAgency;
                return callbackAsync(null, toolData);
              }
            });
          },
          function(toolData, callbackAsync) { //Save bd2k centers
            var promises = [];
            for(var i = 0; i<centers.length; i++){
              var newCenter = centers[i];
              newCenter.AZID = toolData.toolInfo.attributes.AZID;
              promises.push(new Promise(function(resolve, reject){
                Center.forge()
                  .save(newCenter, {transacting: transaction, method: type})
                  .then(function(c){
                    logger.info("ready to commit %s!"+c.attributes.BD2K_CENTER);
                    return resolve(0);
                  })
                  .catch(function(err){
                    logger.info("need to rollback center");
                    logger.debug(err);
                    return resolve(-1);
                  });

              }));
            }
            Promise.all(promises).then(function(values){
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with center');
              else{
                return callbackAsync(null, toolData);
              }
            });
          }

        ],
          function(error, toolData) {

            if(error!=null){
              logger.info('Error with inserting: %s', error);
              logger.info("rolling back %s!", toolInfo.NAME);
              transaction.rollback();
              logger.info('Finished rollback');
              response.status = 'error';
              response.message = "Error inserting metadata into database";
              res.send(response);
            }
            else{
              resID = parseInt(toolData.toolInfo.attributes.AZID);
              logger.info("Committing Tool "+toolData.toolInfo.attributes.NAME+"!");
              transaction.commit(toolData.toolInfo);


              for(var i = 0; i<toolData.tags.length; i++){
                logger.debug("Committing "+tags[i].NAME+"!");
                logger.debug('attach tags:', toolData.tags[i]);
                toolData.toolInfo.tags().attach(toolData.tags[i]);
              }
              for(var i = 0; i<toolData.langs.length; i++){
                logger.debug("Committing "+langs[i].NAME+"!");
                logger.debug('attach languages:', toolData.langs[i]);
                toolData.toolInfo.languages().attach(toolData.langs[i]);
              }

              for(var i = 0; i<toolData.platforms.length; i++){
                logger.debug("Committing "+platforms[i].NAME+"!");
                logger.debug('attach platforms:', toolData.platforms[i]);
                toolData.toolInfo.platform().attach(toolData.platforms[i]);
              }


              if(req.user!=undefined){
                logger.debug('attach user:', req.user);
                toolData.toolInfo.users().attach(req.user);
              }

              m_tool.azid = toolData.toolInfo.attributes.AZID;
              for(var i = 0; i<toolData.agency.length; i++){

                var m_fund = new M_funding;
                m_fund.agency_id = toolData.agency[i].attributes.AGENCY_ID;
                m_fund.funding_agency = agency[i].NAME;
                m_fund.funding_grant = funding[i].GRANT_NUM;
                m_tool.funding.push(m_fund);
              }

              logger.debug('attach institutions');
              toolData.toolInfo.institutions().attach(institutions);

              m_tool.save(function (err) {
                if(err){
                  logger.info('mongo error');
                  logger.debug(err);
                }
                logger.debug('mongo success');
              });


            }
          }
      );
    }).then(function(){
      logger.info("%s was successfully inserted!", toolInfo.NAME);
      response.status = 'success';
      response.message = "Successfully inserted "+toolInfo.NAME;
      response.id = resID;
      res.send(response);
    }).catch(function(err){
      logger.debug(err);
    });
    }



};
