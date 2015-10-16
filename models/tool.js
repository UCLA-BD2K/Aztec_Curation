var Bookshelf = require('../config/bookshelf');
var Link = require('./mysql/relatedLinks.js');
var Author = require('./mysql/author.js');
var Domain = require('./mysql/domain.js');
var Downstream = require('./mysql/downstream.js');
var Upstream = require('./mysql/upstream.js');
var Extension = require('./mysql/extension.js');
var Agency = require('./mysql/agency.js');
var Funding = require('./mysql/funding.js');
var Format = require('./mysql/format.js');
var License = require('./mysql/license.js');
var Platform = require('./mysql/platform.js');
var Version = require('./mysql/version.js');
var Map = require('./mysql/map.js');
var Toolio = require('./mysql/toolio.js');




// define the schema for our tool model
var toolSchema = Bookshelf.Model.extend({

    tableName: 'TOOL_INFO',
    idAttribute: 'AZID',
    links: function() {
      return this.hasMany(Link, 'AZID');
    },
    authors: function() {
      return this.belongsToMany(Author, 'TOOL_AUTHOR', 'AZID', 'AUTHOR_ID');
    },
    domains: function() {
      return this.belongsToMany(Domain, 'TOOL_DOMAINS', 'AZID', 'DOMAIN_ID');
    },
    downstream: function() {
      return this.hasMany(Downstream, 'AZID');
    },
    upstream: function() {
      return this.hasMany(Upstream, 'AZID');
    },
    extension: function() {
      return this.hasOne(Extension, 'AZID');
    },
    agency: function() {
      return this.belongsToMany(Agency, 'FUNDING', 'AZID', 'AGENCY_ID')
    },
    funding: function() {
      return this.hasMany(Funding, 'AZID');
    },
    format: function() {
      return this.belongsToMany(Format, 'TOOL_IO', 'AZID', 'IO_ID')
    },
    license: function() {
      return this.belongsToMany(License, 'TOOL_LICENSE', 'AZID', 'LICENSE_ID')
    },
    platform: function() {
      return this.belongsToMany(Platform, 'TOOL_PLATFORM', 'AZID', 'PLATFORM_ID');
    },
    version: function() {
      return this.hasMany(Version, 'AZID');
    },
    map: function() {
      return this.hasOne(Map, 'AZID');
    },
    io: function() {
      return this.hasMany(Toolio, 'AZID');
    }
});

// methods ======================


// create the model for tools and expose it to our app
module.exports = toolSchema;
