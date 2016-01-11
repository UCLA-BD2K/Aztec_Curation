var async = require('async');
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

var M_tool = require('../models/mongo/toolMisc.js');
var M_funding = require('../models/mongo/funding.js');
var M_link = require('../models/mongo/link.js');
var M_publication = require('../models/mongo/publication.js');
var M_version = require('../models/mongo/version.js');



function unflatten(data) {
    "use strict";
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
        resultholder = {};
    for (var p in data) {
        var cur = resultholder,
            prop = "",
            m;
        while (m = regex.exec(p)) {
            cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
};

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
    var obj = unflatten(req.body);
    var toolInfo = {};
    var authors = [];
    var res_types = [];
    var domains = [];
    var tags = [];
    var links = [];
    var langs = [];
    var platforms = [];
    var versions = [];
    var license = {};
    var agency = [];
    var funding = [];
    var institutions = [];

    var m_tool = new M_tool;
    console.log('user submitted', obj);

    // get basic tool info
    if(obj['basic']!=undefined){
      if(obj['basic']['res_name']!=undefined)
        toolInfo.NAME = obj['basic']['res_name'];
      if(obj['basic']['res_logo']!=undefined)
        toolInfo.LOGO_LINK = obj['basic']['res_logo'];
      if(obj['basic']['res_desc']!=undefined)
        toolInfo.DESCRIPTION= obj['basic']['res_desc'];
    }
    if(obj['publication']!=undefined && obj['publication']['pub_primary_doi']!=undefined){
      toolInfo.PRIMARY_PUB_DOI = obj['publication']['pub_primary_doi'];
      var m_pub = new M_publication;
      m_pub.pub_doi = obj['publication']['pub_primary_doi'];
      m_pub.primary = true;
      m_tool.publications.push(m_pub);
    }
    if(obj['dev']!=undefined && obj['dev']['res_code_url']!=undefined)
      toolInfo.SOURCE_LINK = obj['dev']['res_code_url'];
    // get author info
    if(obj['authors']!=undefined && obj['authors']['authors']!=undefined){
      for(var i = 0; i<obj['authors']['authors'].length; i++){
        if(obj['authors']['authors'][i]['author_name']==undefined || obj['authors']['authors'][i]['author_email']==undefined)
          break;
        var name = obj['authors']['authors'][i]['author_name'].split(' ');
        var author = {FIRST_NAME: name[0], LAST_NAME: name[1], EMAIL: obj['authors']['authors'][i]['author_email'] };
        authors.push(author);
      }
    }
    if(obj['authors']!=undefined && obj['authors']['institution']!=undefined){
      for(var i = 0; i<obj['authors']['institution'].length; i++){
        institutions.push(obj['authors']['institution'][i]['inst_id']);
      }
    }

    // get resource type
    if(obj['basic']!=undefined && obj['basic']['res_types']!=undefined){
      for(var i = 0; i<obj['basic']['res_types'].length; i++){
        var res_type;
        if(obj['basic']['res_types'][i]['res_type']=='Other')
          res_type = obj['basic']['res_types'][i]['res_type_other'];
        else
          res_type = obj['basic']['res_types'][i]['res_type'];
        res_types.push({RESOURCE_TYPE: res_type});
      }
    }

    // get domain info
    if(obj['basic']!=undefined && obj['basic']['bio_domains']!=undefined){
      for(var i = 0; i<obj['basic']['bio_domains'].length; i++){
        domains.push({DOMAIN: obj['basic']['bio_domains'][i]['bio_domain']});
      }
    }

    // get tags
    if(obj['basic']!=undefined && obj['basic']['tags']!=undefined){
      for(var i = 0; i<obj['basic']['tags'].length; i++){
        tags.push({NAME: obj['basic']['tags'][i]['text']});
      }
    }

    // get links
    if(obj['publication']!=undefined && obj['publication']['pub_dois']!=undefined){
      for(var i = 0; i<obj['publication']['pub_dois'].length; i++){
        links.push({TYPE:'PUB DOI', URL: obj['publication']['pub_dois'][i]['pub_doi']});
        var m_pub = new M_publication;
        m_pub.pub_doi = obj['publication']['pub_dois'][i]['pub_doi'];
        m_tool.publications.push(m_pub);
      }
    }
    if(obj['links']!=undefined && obj['links']['links']!=undefined){
      for(var i = 0; i<obj['links']['links'].length; i++){
        links.push({TYPE:obj['links']['links'][i]['link_name'], URL: obj['links']['links'][i]['link_url']});
        var m_link = new M_link;
        m_link.link_name = obj['links']['links'][i]['link_name'];
        m_link.link_url = obj['links']['links'][i]['link_url'];
        m_tool.links.push(m_link);
      }
    }

    // get programming languages
    if(obj['dev']!=undefined && obj['dev']['dev_lang']!=undefined){
      for(var i = 0; i<obj['dev']['dev_lang'].length; i++){
        langs.push({NAME: obj['dev']['dev_lang'][i]['lang_name']});
      }
    }

    // get platforms
    if(obj['dev']!=undefined && obj['dev']['dev_platform']!=undefined){
      for(var i = 0; i<obj['dev']['dev_platform'].length; i++){
        platforms.push({NAME: obj['dev']['dev_platform'][i]['platform_name']});
      }
    }

    // get versions
    if(obj['version']!=undefined){
      versions.push({VERSION: obj['version']['latest_version'],
                      LATEST: 1,
                      VERSION_DATE: toMysqlDate(new Date(obj['version']['latest_version_date'])),
                      DESCRIPTION: obj['version']['latest_version_desc']
                      });
      var m_ver = new M_version;
      m_ver.version_number = obj['version']['latest_version'];
      m_ver.version_description = obj['version']['latest_version_desc'];
      m_ver.version_date = new Date(obj['version']['latest_version_date']);
      m_ver.latest = true;
      m_tool.versions.push(m_ver);
      if(obj['version']!=undefined && obj['version']['prev_versions']!=undefined){
        for(var i = 0; i<obj['version']['prev_versions'].length; i++){
          versions.push({VERSION: obj['version']['prev_versions'][i]['version_number'],
                          DESCRIPTION: obj['version']['prev_versions'][i]['version_description'],
                          VERSION_DATE: toMysqlDate(new Date(obj['version']['prev_versions'][i]['version_date']))
                          });
          var prev_ver = new M_version;
          prev_ver.version_number = obj['version']['latest_version'];
          prev_ver.version_description = obj['version']['latest_version_desc'];
          prev_ver.version_date = new Date(obj['version']['latest_version_date']);
          m_tool.versions.push(prev_ver);
        }
      }
    }

    // get license
    if(obj['license']!=undefined){
      if(obj['license']['license']!=undefined && obj['license']['license_version']!=undefined && obj['license']['license_type']!=undefined){
        license = {
          NAME:  obj['license']['license'],
          VERSION: obj['license']['license_version'],
          OPEN: (obj['license']['license_type']==1),
        };
        if(obj['license']['other_license']!=undefined)
          license.NAME = obj['license']['other_license'];
        if(obj['license']['other_license_link']!=undefined)
          license.LINK = obj['license']['other_license_link'];
      }
    }

    // get funding
    if(obj['funding']!=undefined && obj['funding']['funding']!=undefined){
      for(var i = 0; i<obj['funding']['funding'].length; i++){
        agency.push({NAME: obj['funding']['funding'][i]['funding_agency']})
        funding.push({GRANT_NUM: obj['funding']['funding'][i]['funding_grant']});
      }
    }
    console.log(1);




    console.log('tool info', JSON.stringify(toolInfo));
    console.log('author:',JSON.stringify(authors));
    console.log('resource types', JSON.stringify(res_types));
    console.log('domains', JSON.stringify(domains));
    console.log('tags', JSON.stringify(tags));
    console.log('links', JSON.stringify(links));
    console.log('languages', JSON.stringify(langs));
    console.log('platforms', JSON.stringify(platforms));
    console.log('version', JSON.stringify(versions));
    console.log('license', JSON.stringify(license));
    console.log('funding', JSON.stringify(agency), JSON.stringify(funding));

    var response = {};
    if(toolInfo.NAME==undefined || toolInfo.DESCRIPTION==undefined || (toolInfo.SOURCE_LINK==undefined && links.length==0)){
      response.success = false;
      response.message = "Must enter the minimum fields: Resource Name, Description, and Source Code URL or at least 1 link."
      console.log(2);
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
                    console.log("ready to commit "+toolInfo.NAME+"!");
                    return callbackAsync(null, {toolInfo: tool});
                  })
                  .catch(function(){
                    console.log("need to rollback "+toolInfo.NAME+"!");
                    return callbackAsync('Error with Tool Info', 0);
                  });


          },
          function(toolData, callbackAsync) { //Save author info
            var promises = [];
            var insertAuthors = [];
            for(var i = 0; i<authors.length; i++){
              promises.push(new Promise(function(resolve, reject){
                Author.forge()
                  .save(authors[i], {transacting: transaction, method: type})
                  .then(function(author){
                    console.log("ready to commit "+author.attributes.FIRST_NAME+"!");
                    insertAuthors.push(author);
                    resolve(0);
                  })
                  .catch(function(err){
                    console.log("need to rollback author", err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              console.log(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with Authors', 0);
              else{
                toolData.authors = insertAuthors;
                return callbackAsync(null, toolData);
              }
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
                    console.log("ready to commit "+res.attributes.RESOURCE_TYPE+"!");
                    resolve(0);
                  })
                  .catch(function(err){
                    console.log("need to rollback resource type", err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              console.log(values);
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
                    console.log("ready to commit "+dom.attributes.DOMAIN+"!");
                    resolve(0);
                  })
                  .catch(function(err){
                    console.log("need to rollback domain info", err);
                    resolve(-1);
                  });
              }));
            }
            Promise.all(promises).then(function(values){
              console.log(values);
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
                          console.log('Found existing tag:', tag.attributes.NAME);
                          insertTags.push(tag);
                          return cb('found');
                        }
                      })
                      .catch(function(err){
                        console.log('query tag error', err);
                        return cb('error');
                      })
                  },
                  function(newtag, cb){
                    Tag.forge()
                      .save(newtag, {transacting: transaction, method: type})
                      .then(function(tag){
                        console.log("ready to commit "+tag.attributes.NAME+"!");
                        insertTags.push(tag);
                        cb(null);
                      })
                      .catch(function(err){
                        console.log("need to rollback tags", err);
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
              console.log(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with tags');
              else{
                toolData.tags = insertTags;
                return callbackAsync(null, toolData);
              }
            });
          },
          // function(toolData, callbackAsync) { //Save links
          //   var promises = [];
          //   var insertLinks = [];
          //   for(var i = 0; i<links.length; i++){
          //     promises.push(new Promise(function(resolve, reject){
          //       links[i].AZID = toolData.toolInfo.attributes.AZID;
          //       Link.forge()
          //         .save(links[i], {transacting: transaction, method: type})
          //         .then(function(link){
          //           console.log("ready to commit "+link.attributes.URL+"!");
          //           insertLinks.push(link);
          //           resolve(0);
          //         })
          //         .catch(function(err){
          //           console.log("need to rollback links", err);
          //           resolve(-1);
          //         });
          //     }));
          //   }
          //   Promise.all(promises).then(function(values){
          //     console.log(values);
          //     if(values.indexOf(-1)>-1)
          //       return callbackAsync('Error with Links', 0);
          //     else{
          //       toolData.links = insertLinks;
          //       return callbackAsync(null, toolData);
          //     }
          //   });
          // },
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
                          console.log('Found existing language:', lang.attributes.NAME);
                          insertLangs.push(lang);
                          return cb('found');
                        }
                      })
                      .catch(function(err){
                        console.log('query language error', err);
                        return cb('error');
                      })
                  },
                  function(newlang, cb){
                    Language.forge()
                      .save(newlang, {transacting: transaction, method: type})
                      .then(function(lang){
                        console.log("ready to commit "+lang.attributes.NAME+"!");
                        insertLangs.push(lang);
                        cb(null);
                      })
                      .catch(function(err){
                        console.log("need to rollback languages", err);
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
              console.log(values);
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
                async.waterfall([
                  function(cb){
                    var currentPlatform = platforms[i];
                    Platform.forge()
                      .query({where: {NAME: currentPlatform.NAME}})
                      .fetch()
                      .then(function(platform){
                        if(platform==null){
                          return cb(null, currentPlatform);
                        }
                        else{
                          console.log('Found existing platform:', platform.attributes.NAME);
                          insertPlatforms.push(platform);
                          return cb('found');
                        }
                      })
                      .catch(function(err){
                        console.log('query platform error', err);
                        return cb('error');
                      })
                  },
                  function(newplatform, cb){
                    Platform.forge()
                      .save(newplatform, {transacting: transaction, method: type})
                      .then(function(platform){
                        console.log("ready to commit "+platform.attributes.NAME+"!");
                        insertPlatforms.push(platform);
                        cb(null);
                      })
                      .catch(function(err){
                        console.log("need to rollback platforms", err);
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
              console.log(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with platforms');
              else{
                toolData.platforms = insertPlatforms;
                return callbackAsync(null, toolData);
              }
            });
          },
          // function(toolData, callbackAsync) { //Save version
          //   var promises = [];
          //   for(var i = 0; i<versions.length; i++){
          //     versions[i].AZID = toolData.toolInfo.attributes.AZID;
          //     promises.push(new Promise(function(resolve, reject){
          //       Version.forge()
          //         .save(versions[i], {transacting: transaction, method: type})
          //         .then(function(ver){
          //           console.log("ready to commit "+ver.attributes.VERSION+"!");
          //           resolve(0);
          //         })
          //         .catch(function(err){
          //           console.log("need to rollback version", err);
          //           resolve(-1);
          //         });
          //     }));
          //   }
          //   Promise.all(promises).then(function(values){
          //     console.log(values);
          //     if(values.indexOf(-1)>-1)
          //       return callbackAsync('Error with version');
          //     else{
          //       return callbackAsync(null, toolData);
          //     }
          //   });
          // },
          function(toolData, callbackAsync) { //Save license
            if(Object.keys(license).length==0)
              return callbackAsync(null, toolData);
            async.waterfall([
              function(cb){
                License.forge()
                  .query({where: {NAME: license.NAME, VERSION: license.VERSION}})
                  .fetch()
                  .then(function(lic){
                    if(lic==null){
                      return cb(null, license);
                    }
                    else{
                      console.log('Found existing license:', lic.attributes.NAME);
                      toolData.license = lic;
                      return cb('found');
                    }
                  })
                  .catch(function(err){
                    console.log('query license error', err);
                    return cb('error');
                  })
              },
              function(newLicense, cb){
                License.forge()
                  .save(newLicense, {transacting: transaction, method: type})
                  .then(function(lic){
                    console.log("ready to commit "+lic.attributes.NAME+"!");
                    toolData.license = lic;
                    return cb('new');
                  })
                  .catch(function(err){
                    console.log("need to rollback license", err);
                    return cb('error');
                  });
              }
            ],
            function(error){
              if(error=='error'){
                callbackAsync('license');
              }
              else {
                callbackAsync(null, toolData);
              }
            });
          },
          function(toolData, callbackAsync) { //Save funding
            var promises = [];
            var insertFunding = [];
            for(var i = 0; i<agency.length; i++){
              promises.push(new Promise(function(resolve, reject){
                async.waterfall([
                  function(cb){
                    var currentAgency = agency[i];
                    var currentFunding = funding[i];
                    Agency.forge()
                      .query({where: {NAME: currentAgency.NAME}})
                      .fetch()
                      .then(function(a){
                        if(a==null){
                          return cb(null, false, currentAgency, currentFunding);
                        }
                        else{
                          console.log('Found existing Agency:', a.attributes.NAME);
                          insertFunding.push(a);
                          return cb(null, true, a, currentFunding);
                        }
                      })
                      .catch(function(err){
                        console.log('query agency error', err);
                        return cb('error');
                      })
                  },
                  function(foundAgency, newAgency, newFunding, cb){
                    if(foundAgency){
                      return cb(null, newAgency, newFunding);
                    }
                    Agency.forge()
                      .save(newAgency, {transacting: transaction, method: type})
                      .then(function(a){
                        console.log("ready to commit "+a.attributes.NAME+"!");
                        insertFunding.push(a);
                        return cb(null, a, newFunding);
                      })
                      .catch(function(err){
                        console.log("need to rollback agency", err);
                        return cb('error');
                      });
                  },
                  // function(newAgency, newFunding, cb){
                  //   newFunding.AZID = toolData.toolInfo.attributes.AZID;
                  //   newFunding.AGENCY_ID = newAgency.attributes.AGENCY_ID;
                  //   Funding.forge()
                  //     .save(newFunding, {transacting: transaction, method: type})
                  //     .then(function(f){
                  //       console.log("ready to commit "+f.attributes.GRANT_NUM+"!");
                  //       return cb(null);
                  //     })
                  //     .catch(function(err){
                  //       console.log("need to rollback funding", err);
                  //       return cb('error');
                  //     });
                  // }
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
              console.log(values);
              if(values.indexOf(-1)>-1)
                return callbackAsync('Error with funding');
              else{
                toolData.funding = insertFunding;
                return callbackAsync(null, toolData);
              }
            });
          }

        ],
          function(error, toolData) {
            console.log('finish',error, toolData);
            if(error!=null){
              console.log(error);
              console.log("rolling back "+toolInfo.NAME+"!");
              transaction.rollback(toolInfo);
              for(var i = 0; i<authors.length; i++){
                console.log("rolling back "+authors[i].FIRST_NAME+"!");
                transaction.rollback(authors[i]);
              }
              for(var i = 0; i<res_types.length; i++){
                console.log("rolling back "+res_types[i].RESOURCE_TYPE+"!");
                transaction.rollback(res_types[i]);
              }
              for(var i = 0; i<domains.length; i++){
                console.log("rolling back "+domains[i].DOMAIN+"!");
                transaction.rollback(domains[i]);
              }
              for(var i = 0; i<tags.length; i++){
                console.log("rolling back "+tags[i].NAME+"!");
                transaction.rollback(tags[i]);
              }
              // for(var i = 0; i<links.length; i++){
              //   console.log("rolling back "+links[i].URL+"!");
              //   transaction.rollback(links[i]);
              // }
              for(var i = 0; i<langs.length; i++){
                console.log("rolling back "+langs[i].NAME+"!");
                transaction.rollback(langs[i]);
              }
              for(var i = 0; i<platforms.length; i++){
                console.log("rolling back "+platforms[i].NAME+"!");
                transaction.rollback(platforms[i]);
              }
              // for(var i = 0; i<versions.length; i++){
              //   console.log("rolling back "+versions[i].VERSION+"!");
              //   transaction.rollback(versions[i]);
              // }
              console.log("rolling back "+license.NAME+"!");
              transaction.rollback(license);
              for(var i = 0; i<agency.length; i++){
                console.log("rolling back "+agency[i].NAME+" "+funding[i].GRANT_NUM+"!");
                transaction.rollback(agency[i]);
                //transaction.rollback(funding[i]);
              }
            }
            else{
              console.log("Committing Tool "+toolData.toolInfo.attributes.NAME+"!");
              transaction.commit(toolData.toolInfo);

              // committing author and tool relationship
              for(var i = 0; i<toolData.authors.length; i++){
                console.log("Committing "+authors[i].FIRST_NAME+"!");
                toolData.toolInfo.authors().attach(toolData.authors[i]);
              }


              for(var i = 0; i<toolData.tags.length; i++){
                console.log("Committing "+tags[i].NAME+"!");
                console.log('attach tags:', toolData.tags[i]);
                toolData.toolInfo.tags().attach(toolData.tags[i]);
              }
              for(var i = 0; i<toolData.langs.length; i++){
                console.log("Committing "+langs[i].NAME+"!");
                console.log('attach languages:', toolData.langs[i]);
                toolData.toolInfo.languages().attach(toolData.langs[i]);
              }

              for(var i = 0; i<toolData.platforms.length; i++){
                console.log("Committing "+platforms[i].NAME+"!");
                console.log('attach platforms:', toolData.platforms[i]);
                toolData.toolInfo.platform().attach(toolData.platforms[i]);
              }

              console.log('attach license:', toolData.license);
              toolData.toolInfo.license().attach(toolData.license);

              console.log('attach user:', req.user);
              toolData.toolInfo.users().attach(req.user);

              m_tool.azid = toolData.toolInfo.attributes.AZID;
              for(var i = 0; i<toolData.funding.length; i++){
                var m_fund = new M_funding;
                m_fund.agency_id = toolData.funding[i].attributes.AGENCY_ID;
                m_fund.funding_agency = agency[i].NAME;
                m_fund.funding_grant = funding[i].GRANT_NUM;
                m_tool.funding.push(m_fund);
              }

              console.log('attach institutions');
              toolData.toolInfo.institutions().attach(institutions);

              m_tool.save(function (err) {
                if(err)
                  console.log('mongo error', err);
                console.log('mongo success');
              });


            }
            //return res.send("UPDATE COMPLETE!"); //Return whatever page or message
          }
      );
    }).then(function(){
      console.log(toolInfo.NAME+" was successfully inserted!");
      response.success = true;
      response.message = "Successfully inserted "+toolInfo.NAME;
      res.send(response);
    }).catch(function(err){
      console.log(err);
    });
    }



};
