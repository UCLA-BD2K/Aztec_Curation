var M_tool = require('../../models/mongo/toolMisc.js');
var M_funding = require('../../models/mongo/funding.js');
var M_link = require('../../models/mongo/link.js');
var M_publication = require('../../models/mongo/publication.js');
var M_version = require('../../models/mongo/version.js');
var M_author = require('../../models/mongo/author.js');
var M_maintainer = require('../../models/mongo/maintainer.js');

module.exports = {
  convert2readable: function(json){

    var basic = {};
    var authors = {};
    var publication = {};
    var links = {};
    var dev = {};
    var version = {};
    var licenses = {};
    var funding = {};

    basic['AZID'] = json['AZID'];
    basic['res_name'] = json['NAME'];
    basic['res_logo'] = json['LOGO_LINK'];
    basic['res_desc'] = json['DESCRIPTION'];

    basic['res_types'] = [];
    if(json['resource_types']!=undefined){
      json['resource_types'].forEach(function(type){
        var res = {};
        res.res_type = type['RESOURCE_TYPE'];
        if(type['OTHER']!=undefined){
          res.res_type_other = type['OTHER'];
        }
        basic['res_types'].push(res);
      });
    }

    basic['bio_domains'] = [];
    if(json['domains']!=undefined){
      json['domains'].forEach(function(domain){
        basic['bio_domains'].push({bio_domain: domain['DOMAIN']});
      });
    }

    basic['tags'] = [];
    if(json['tags']!=undefined){
      json['tags'].forEach(function(tag){
        basic['tags'].push({text: tag['NAME']});
      });
    }

    authors['authors'] = [];
      if(json['authors']!=undefined){
      json['authors'].forEach(function(author){
        authors['authors'].push({first_name: author['first_name'], last_name: author['last_name'], author_email: author['author_email']});
      });
    }

    authors['maintainers'] = [];
      if(json['maintainers']!=undefined){
      json['maintainers'].forEach(function(maintainer){
        authors['maintainers'].push({first_name: maintainer['first_name'], last_name: maintainer['last_name'], maintainer_email: maintainer['maintainer_email']});
      });
    }

    authors['institution'] = [];
    if(json['institutions']!=undefined){
      json['institutions'].forEach(function(inst){
        if(inst['INST_ID']!=undefined)
          authors['institution'].push({inst_id: inst['INST_ID'], PRIMARY_NAME: inst['NAME']});
        else {
          authors['institution'].push({missing: true, new_institution: inst['new_institution']});
        }
      });
    }

    publication['pub_tool_doi'] = json['TOOL_DOI'];
    publication['pub_dois'] = [];
    if(json['publications']!=undefined){
      json['publications'].forEach(function(pub){
        if(pub['primary']==true){
          publication['pub_primary_doi'] = pub['pub_doi'];
        }
        else{
          publication['pub_dois'].push(pub);
        }
      });
    }


    links['links'] = json['links'];

    dev['res_code_url'] = json['SOURCE_LINK'];

    dev['dev_lang'] = [];
    if(json['languages']!=undefined){
      json['languages'].forEach(function(lang){
        dev['dev_lang'].push({PRIMARY_NAME: lang['NAME']});
      });
    }

    dev['dev_platform'] = [];
    if(json['platform']!=undefined){
      json['platform'].forEach(function(plat){
        dev['dev_platform'].push({platform_name: plat['NAME']});
      });
    }


    version['prev_versions'] = [];
    if(json['version']!=undefined){
      json['version'].forEach(function(ver){
        if(ver['latest']){
          version['latest_version'] = ver['version_number'];
          version['latest_version_date'] = ver['version_date'];
          version['latest_version_desc'] = ver['version_description'];
        }else{
          version['prev_versions'].push({version_number: ver['version_number'], version_description: ver['version_description'], version_date: ver['version_date']});
        }
      });
    }

    licenses['licenses'] = [];
    if(json['license']!=undefined){
      json['license'].forEach(function(lic){

        var newLic = {};
        newLic['license'] = lic['LICENSE_TYPE'];
        if(newLic['license']=='Other' || newLic['license']=='Proprietary'){
          newLic['other_license'] = lic['NAME'];
          newLic['other_license_link'] = lic['LINK'];
          newLic['other_license_desc'] = lic['DESCRIPTION'];
        }

        licenses['licenses'].push(newLic);
      });
    }

    funding['funding'] = json['funding'];

    funding['bd2k'] = [];
    if(json['centers']!=undefined){
      json['centers'].forEach(function(center){
        var pushCenter = {};
        pushCenter['center'] = center['BD2K_CENTER'];
        if(center['PROJECT_NAME']!=null)
          pushCenter['other'] = center['PROJECT_NAME'];
        funding['bd2k'].push(pushCenter);
      });
    }



    // console.log('basic', JSON.stringify(basic));
    // console.log('authors', JSON.stringify(authors));
    // console.log('publication', JSON.stringify(publication));
    // console.log('links', JSON.stringify(links));
    // console.log('dev', JSON.stringify(dev));
    // console.log('version', JSON.stringify(version));
    // console.log('license', JSON.stringify(licenses));
    // console.log('funding', JSON.stringify(funding));
    var result = {
      basic: basic,
      authors: authors,
      publication: publication,
      links: links,
      dev: dev,
      version: version,
      license: licenses,
      funding: funding
    };

    return result;

  },
  convert2mysql: function(obj){
    var toolInfo = {};
    var res_types = [];
    var domains = [];
    var tags = [];
    var links = [];
    var langs = [];
    var platforms = [];
    var license = [];
    var agency = [];
    var funding = [];
    var institutions = [];
    var centers = [];

    var m_tool = new M_tool;
    // get basic tool info
    if(obj['basic']!=undefined){
      if(obj['basic']['AZID']!=undefined)
        toolInfo.AZID = obj['basic']['AZID'];
      if(obj['basic']['res_name']!=undefined)
        toolInfo.NAME = obj['basic']['res_name'];
      if(obj['basic']['res_logo']!=undefined)
        toolInfo.LOGO_LINK = obj['basic']['res_logo'];
      if(obj['basic']['res_desc']!=undefined)
        toolInfo.DESCRIPTION= obj['basic']['res_desc'];
    }
    if(obj['publication']!=undefined){
        if(obj['publication']['pub_primary_doi']!=undefined){
        toolInfo.PRIMARY_PUB_DOI = obj['publication']['pub_primary_doi'];
        var m_pub = new M_publication;
        m_pub.pub_doi = obj['publication']['pub_primary_doi'];
        m_pub.primary = true;
        m_tool.publications.push(m_pub);
      }
      if(obj['publication']['pub_tool_doi']!=undefined){
        toolInfo.TOOL_DOI = obj['publication']['pub_tool_doi'];
      }
    }
    if(obj['dev']!=undefined && obj['dev']['res_code_url']!=undefined)
      toolInfo.SOURCE_LINK = obj['dev']['res_code_url'];
    // get author info
    if(obj['authors']!=undefined && obj['authors']['authors']!=undefined){
      for(var i = 0; i<obj['authors']['authors'].length; i++){
        if(obj['authors']['authors'][i]['first_name']==undefined || obj['authors']['authors'][i]['author_email']==undefined)
          break;

        var m_author = new M_author;
        m_author['first_name'] = obj['authors']['authors'][i]['first_name'];
        m_author['last_name'] = obj['authors']['authors'][i]['last_name'];
        m_author['author_email'] = obj['authors']['authors'][i]['author_email'];
        m_tool.authors.push(m_author);

      }
    }
    if(obj['authors']!=undefined && obj['authors']['maintainers']!=undefined){

      for(var i = 0; i<obj['authors']['maintainers'].length; i++){
        var m_maintainer = new M_maintainer;
        m_maintainer['first_name'] = obj['authors']['maintainers'][i]['first_name'];
        m_maintainer['last_name'] = obj['authors']['maintainers'][i]['last_name'];
        m_maintainer['maintainer_email'] = obj['authors']['maintainers'][i]['maintainer_email'];
        m_tool.maintainers.push(m_maintainer);
      }
    }
    if(obj['authors']!=undefined && obj['authors']['institution']!=undefined){
      for(var i = 0; i<obj['authors']['institution'].length; i++){
        if(obj['authors']['institution'][i]['inst_id']!=undefined)
          institutions.push(obj['authors']['institution'][i]['inst_id']);
        else {
          m_tool.missing_inst.push({new_institution: obj['authors']['institution'][i]['new_institution']});
        }
      }
    }
    // get resource type
    if(obj['basic']!=undefined && obj['basic']['res_types']!=undefined){
      for(var i = 0; i<obj['basic']['res_types'].length; i++){
        var res_type = {};
        if(obj['basic']['res_types'][i]['res_type']=='Other'){
          res_type['RESOURCE_TYPE'] = 'Other';
          res_type['OTHER'] = obj['basic']['res_types'][i]['res_type_other'];
        }
        else{
          res_type['RESOURCE_TYPE'] = obj['basic']['res_types'][i]['res_type'];
        }

        res_types.push(res_type);
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
      if(obj['publication']['pub_primary_doi']){
          var m_pub = new M_publication;
          m_pub.pub_doi = obj['publication']['pub_primary_doi'];
          m_pub.primary = true;
          m_tool.publications.push(m_pub);
      }

      for(var i = 0; i<obj['publication']['pub_dois'].length; i++){
        links.push({TYPE:'PUB DOI', URL: obj['publication']['pub_dois'][i]['pub_doi']});
        var m_pub = new M_publication;
        m_pub.pub_doi = obj['publication']['pub_dois'][i]['pub_doi'];
        m_tool.publications.push(m_pub);
      }
    }
    if(obj['links']!=undefined && obj['links']['links']!=undefined){
      for(var i = 0; i<obj['links']['links'].length; i++){
        var m_link = new M_link;
        m_link.link_name = obj['links']['links'][i]['link_name'];
        m_link.link_url = obj['links']['links'][i]['link_url'];
        m_tool.links.push(m_link);
      }
    }
    // get programming languages
    if(obj['dev']!=undefined && obj['dev']['dev_lang']!=undefined){
      for(var i = 0; i<obj['dev']['dev_lang'].length; i++){
        langs.push({NAME: obj['dev']['dev_lang'][i]['PRIMARY_NAME']});
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

      var m_ver = new M_version;
      m_ver.version_number = obj['version']['latest_version'];
      m_ver.version_description = obj['version']['latest_version_desc'];
      m_ver.version_date = new Date(obj['version']['latest_version_date']);
      m_ver.latest = true;
      m_tool.versions.push(m_ver);

      if(obj['version']['prev_versions']!=undefined){
        for(var i = 0; i<obj['version']['prev_versions'].length; i++){
          var prev_ver = new M_version;
          prev_ver.version_number = obj['version']['prev_versions'][i]['version_number'];
          prev_ver.version_description = obj['version']['prev_versions'][i]['version_description'];
          prev_ver.version_date = new Date(obj['version']['prev_versions'][i]['version_date']);
          m_tool.versions.push(prev_ver);
        }

      }
    }



    // get license
    if(obj['license']!=undefined && obj['license']['licenses']!=undefined){
      for(var i = 0; i<obj['license']['licenses'].length; i++){
        var newLic = {};
        if(obj['license']['licenses'][i]['license']!=undefined){
          newLic = {
            LICENSE_TYPE: obj['license']['licenses'][i]['license'],
          };
          if(obj['license']['licenses'][i]['license']=='Other' || obj['license']['licenses'][i]['license']=='Proprietary'){
            newLic.NAME=  obj['license']['licenses'][i]['other_license'];

            if(obj['license']['licenses'][i]['other_license_link']!=undefined)
              newLic.LINK = obj['license']['licenses'][i]['other_license_link'];
            if(obj['license']['licenses'][i]['other_license_desc']!=undefined)
              newLic.DESCRIPTION = obj['license']['licenses'][i]['other_license_desc'];
          }
        }

        license.push(newLic);
      }

    }
    // get funding
    if(obj['funding']!=undefined && obj['funding']['funding']!=undefined){
      for(var i = 0; i<obj['funding']['funding'].length; i++){
        agency.push({NAME: obj['funding']['funding'][i]['funding_agency']})
        funding.push({GRANT_NUM: obj['funding']['funding'][i]['funding_grant']});
      }
    }

    if(obj['funding']!=undefined && obj['funding']['bd2k']!=undefined){
      for(var i = 0; i<obj['funding']['bd2k'].length; i++){
        var center = {};
        center['BD2K_CENTER'] = obj['funding']['bd2k'][i]['center'];
        if(obj['funding']['bd2k'][i]['center']=='Other' && obj['funding']['bd2k'][i]['other']!=undefined){
          center['PROJECT_NAME'] = obj['funding']['bd2k'][i]['other'];
        }
        centers.push(center);
      }
    }
  return {
    toolInfo: toolInfo,
    m_tool: m_tool,
    institutions: institutions,
    res_types: res_types,
    domains: domains,
    tags: tags,
    langs: langs,
    platforms: platforms,
    license: license,
    agency: agency,
    funding: funding,
    centers: centers
  };
}
};
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
};

function toMysqlDate(date){
  return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth()) + "-" + twoDigits(date.getUTCDate());
};
