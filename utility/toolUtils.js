var M_tool = require('../models/mongo/toolMisc.js');
var M_funding = require('../models/mongo/funding.js');
var M_link = require('../models/mongo/link.js');
var M_publication = require('../models/mongo/publication.js');
var M_version = require('../models/mongo/version.js');
var M_author = require('../models/mongo/author.js');
var M_maintainer = require('../models/mongo/maintainer.js');

function ToolUtils() {
  var self = this;

  this.mysql2rest = function(json) {
    return self._mysql2rest(self, json);
  };
  this.rest2mysql = function(toolJSON) {
    return self._rest2mysql(self, toolJSON);
  };
  this.unflatten = function(json) {
    return self._unflatten(self, json);
  };
  this.removeHash = function(json) {
    return self._removeHash(self, json);
  };

}

ToolUtils.prototype._mysql2rest = function(self, json) {
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
  basic['submit_date'] = json['SUBMIT_DATE'];

  basic['res_types'] = [];
  if (json['resource_types'] != undefined) {
    json['resource_types'].forEach(function(type) {
      var res = {};
      res.res_type = type['RESOURCE_TYPE'];
      if (type['OTHER'] != undefined) {
        res.res_type_other = type['OTHER'];
      }
      basic['res_types'].push(res);
    });
  }

  basic['bio_domains'] = [];
  if (json['domains'] != undefined) {
    json['domains'].forEach(function(domain) {
      basic['bio_domains'].push({
        bio_domain: domain['DOMAIN']
      });
    });
  }

  basic['tags'] = [];
  if (json['tags'] != undefined) {
    json['tags'].forEach(function(tag) {
      basic['tags'].push({
        text: tag['NAME']
      });
    });
  }

  authors['authors'] = [];
  if (json['authors'] != undefined) {
    json['authors'].forEach(function(author) {
      authors['authors'].push({
        first_name: author['first_name'],
        last_name: author['last_name'],
        author_email: author['author_email']
      });
    });
  }

  authors['maintainers'] = [];
  if (json['maintainers'] != undefined) {
    json['maintainers'].forEach(function(maintainer) {
      authors['maintainers'].push({
        first_name: maintainer['first_name'],
        last_name: maintainer['last_name'],
        maintainer_email: maintainer['maintainer_email']
      });
    });
  }
  authors['institution'] = [];
  if (json['institutions'] != undefined) {
    json['institutions'].forEach(function(inst) {
      if (inst['NAME'] != undefined)
        authors['institution'].push({
          inst_name: inst['NAME']
        });
      else {
        authors['institution'].push({
          missing: true,
          new_institution: inst['new_institution']
        });
      }
    });
  }

  publication['pub_tool_doi'] = json['TOOL_DOI'];
  publication['pub_dois'] = [];
  if (json['publications'] != undefined) {
    json['publications'].forEach(function(pub) {
      if (pub['primary'] == true) {
        publication['pub_primary_doi'] = pub['pub_doi'];
      } else {
        publication['pub_dois'].push(pub);
      }
    });
  }


  links['links'] = json['links'];

  dev['res_code_url'] = json['SOURCE_LINK'];

  dev['dev_lang'] = [];
  if (json['languages'] != undefined) {
    json['languages'].forEach(function(lang) {
      dev['dev_lang'].push({
        PRIMARY_NAME: lang['NAME']
      });
    });
  }

  dev['dev_platform'] = [];
  if (json['platform'] != undefined) {
    json['platform'].forEach(function(plat) {
      dev['dev_platform'].push({
        platform_name: plat['NAME']
      });
    });
  }


  version['prev_versions'] = [];
  if (json['version'] != undefined) {
    json['version'].forEach(function(ver) {
      if (ver['latest']) {
        version['latest_version'] = ver['version_number'];
        version['latest_version_date'] = ver['version_date'];
        version['latest_version_desc'] = ver['version_description'];
      } else {
        version['prev_versions'].push({
          version_number: ver['version_number'],
          version_description: ver['version_description'],
          version_date: ver['version_date']
        });
      }
    });
  }

  licenses['licenses'] = [];
  if (json['license'] != undefined) {
    json['license'].forEach(function(lic) {

      var newLic = {};
      newLic['license'] = lic['LICENSE_TYPE'];
      if (newLic['license'] == 'Other' || newLic['license'] == 'Proprietary') {
        newLic['other_license'] = lic['NAME'];
        newLic['other_license_link'] = lic['LINK'];
        newLic['other_license_desc'] = lic['DESCRIPTION'];
      }

      licenses['licenses'].push(newLic);
    });
  }

  funding['funding'] = json['funding'];

  funding['bd2k'] = [];
  if (json['centers'] != undefined) {
    json['centers'].forEach(function(center) {
      var pushCenter = {};
      pushCenter['center'] = center['BD2K_CENTER'];
      if (center['PROJECT_NAME'] != null)
        pushCenter['other'] = center['PROJECT_NAME'];
      funding['bd2k'].push(pushCenter);
    });
  }

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
};

ToolUtils.prototype._rest2mysql = function(self, json) {
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
  if (json['basic'] != undefined) {
    if (json['basic']['AZID'] != undefined)
      toolInfo.AZID = json['basic']['AZID'];
    if (json['basic']['res_name'] != undefined)
      toolInfo.NAME = json['basic']['res_name'];
    if (json['basic']['res_logo'] != undefined)
      toolInfo.LOGO_LINK = json['basic']['res_logo'];
    if (json['basic']['res_desc'] != undefined)
      toolInfo.DESCRIPTION = json['basic']['res_desc'];
  }
  if (json['publication'] != undefined) {
    if (json['publication']['pub_primary_doi'] != undefined) {
      toolInfo.PRIMARY_PUB_DOI = json['publication']['pub_primary_doi'];
      var m_pub = new M_publication;
      m_pub.pub_doi = json['publication']['pub_primary_doi'];
      m_pub.primary = true;
      m_tool.publications.push(m_pub);
    }
    if (json['publication']['pub_tool_doi'] != undefined) {
      toolInfo.TOOL_DOI = json['publication']['pub_tool_doi'];
    }
  }

  if (json['dev'] != undefined && json['dev']['res_code_url'] != undefined)
    toolInfo.SOURCE_LINK = json['dev']['res_code_url'];
  // get author info
  if (json['authors'] != undefined && json['authors']['authors'] != undefined) {
    for (var i = 0; i < json['authors']['authors'].length; i++) {
      if (json['authors']['authors'][i]['first_name'] == undefined || json['authors']['authors'][i]['author_email'] == undefined)
        break;

      var m_author = new M_author;
      m_author['first_name'] = json['authors']['authors'][i]['first_name'];
      m_author['last_name'] = json['authors']['authors'][i]['last_name'];
      m_author['author_email'] = json['authors']['authors'][i]['author_email'];
      m_tool.authors.push(m_author);

    }
  }
  if (json['authors'] != undefined && json['authors']['maintainers'] != undefined) {

    for (var i = 0; i < json['authors']['maintainers'].length; i++) {
      var m_maintainer = new M_maintainer;
      m_maintainer['first_name'] = json['authors']['maintainers'][i]['first_name'];
      m_maintainer['last_name'] = json['authors']['maintainers'][i]['last_name'];
      m_maintainer['maintainer_email'] = json['authors']['maintainers'][i]['maintainer_email'];
      m_tool.maintainers.push(m_maintainer);
    }
  }
  if (json['authors'] != undefined && json['authors']['institution'] != undefined) {
    for (var i = 0; i < json['authors']['institution'].length; i++) {
      if (json['authors']['institution'][i]['inst_name'] != undefined)
        institutions.push(json['authors']['institution'][i]['inst_name']);
      else {
        m_tool.missing_inst.push({
          new_institution: json['authors']['institution'][i]['new_institution']
        });
      }
    }
  }
  // get resource type
  if (json['basic'] != undefined && json['basic']['res_types'] != undefined) {
    for (var i = 0; i < json['basic']['res_types'].length; i++) {
      var res_type = {};
      if (json['basic']['res_types'][i]['res_type'] == 'Other') {
        res_type['RESOURCE_TYPE'] = 'Other';
        res_type['OTHER'] = json['basic']['res_types'][i]['res_type_other'];
      } else {
        res_type['RESOURCE_TYPE'] = json['basic']['res_types'][i]['res_type'];
      }

      res_types.push(res_type);
    }
  }

  // get domain info
  if (json['basic'] != undefined && json['basic']['bio_domains'] != undefined) {
    for (var i = 0; i < json['basic']['bio_domains'].length; i++) {
      domains.push({
        DOMAIN: json['basic']['bio_domains'][i]['bio_domain']
      });
    }
  }
  // get tags
  if (json['basic'] != undefined && json['basic']['tags'] != undefined) {
    for (var i = 0; i < json['basic']['tags'].length; i++) {
      tags.push({
        NAME: json['basic']['tags'][i]['text']
      });
    }
  }
  // get links
  if (json['publication'] != undefined && json['publication']['pub_dois'] != undefined) {
    if (json['publication']['pub_primary_doi']) {
      var m_pub = new M_publication;
      m_pub.pub_doi = json['publication']['pub_primary_doi'];
      m_pub.primary = true;
      m_tool.publications.push(m_pub);
    }

    for (var i = 0; i < json['publication']['pub_dois'].length; i++) {
      links.push({
        TYPE: 'PUB DOI',
        URL: json['publication']['pub_dois'][i]['pub_doi']
      });
      var m_pub = new M_publication;
      m_pub.pub_doi = json['publication']['pub_dois'][i]['pub_doi'];
      m_tool.publications.push(m_pub);
    }
  }
  if (json['links'] != undefined && json['links']['links'] != undefined) {
    for (var i = 0; i < json['links']['links'].length; i++) {
      var m_link = new M_link;
      m_link.link_name = json['links']['links'][i]['link_name'];
      m_link.link_url = json['links']['links'][i]['link_url'];
      m_tool.links.push(m_link);
    }
  }
  // get programming languages
  if (json['dev'] != undefined && json['dev']['dev_lang'] != undefined) {
    for (var i = 0; i < json['dev']['dev_lang'].length; i++) {
      langs.push({
        NAME: json['dev']['dev_lang'][i]['PRIMARY_NAME']
      });
    }
  }

  // get platforms
  if (json['dev'] != undefined && json['dev']['dev_platform'] != undefined) {
    for (var i = 0; i < json['dev']['dev_platform'].length; i++) {
      platforms.push({
        NAME: json['dev']['dev_platform'][i]['platform_name']
      });
    }
  }
  // get versions
  if (json['version'] != undefined) {

    var m_ver = new M_version;
    m_ver.version_number = json['version']['latest_version'];
    m_ver.version_description = json['version']['latest_version_desc'];
    m_ver.version_date = new Date(json['version']['latest_version_date']);
    m_ver.latest = true;
    m_tool.versions.push(m_ver);

    if (json['version']['prev_versions'] != undefined) {
      for (var i = 0; i < json['version']['prev_versions'].length; i++) {
        var prev_ver = new M_version;
        prev_ver.version_number = json['version']['prev_versions'][i]['version_number'];
        prev_ver.version_description = json['version']['prev_versions'][i]['version_description'];
        prev_ver.version_date = new Date(json['version']['prev_versions'][i]['version_date']);
        m_tool.versions.push(prev_ver);
      }

    }
  }

  // get license
  if (json['license'] != undefined && json['license']['licenses'] != undefined) {
    for (var i = 0; i < json['license']['licenses'].length; i++) {
      var newLic = {};
      if (json['license']['licenses'][i]['license'] != undefined) {
        newLic = {
          LICENSE_TYPE: json['license']['licenses'][i]['license'],
        };
        if (json['license']['licenses'][i]['license'] == 'Other' || json['license']['licenses'][i]['license'] == 'Proprietary') {
          newLic.NAME = json['license']['licenses'][i]['other_license'];

          if (json['license']['licenses'][i]['other_license_link'] != undefined)
            newLic.LINK = json['license']['licenses'][i]['other_license_link'];
          if (json['license']['licenses'][i]['other_license_desc'] != undefined)
            newLic.DESCRIPTION = json['license']['licenses'][i]['other_license_desc'];
        }
      }

      license.push(newLic);
    }

  }
  // get funding
  if (json['funding'] != undefined && json['funding']['funding'] != undefined) {
    funding = json['funding']['funding'];
  }

  if (json['funding'] != undefined && json['funding']['bd2k'] != undefined) {
    for (var i = 0; i < json['funding']['bd2k'].length; i++) {
      var center = {};
      center['BD2K_CENTER'] = json['funding']['bd2k'][i]['center'];
      if (json['funding']['bd2k'][i]['center'] == 'Other' && json['funding']['bd2k'][i]['other'] != undefined) {
        center['PROJECT_NAME'] = json['funding']['bd2k'][i]['other'];
      }
      centers.push(center);
    }
  }
  return {
    savedID: json['savedID'],
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

};

ToolUtils.prototype._unflatten = function(self, data) {
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

ToolUtils.prototype._removeHash = function(self, json){
  if(json==undefined)
    return [];
  json = json.map(function(obj){
    delete obj['$$hashKey'];
    return obj;
  });
  return json;
};

module.exports = new ToolUtils();
