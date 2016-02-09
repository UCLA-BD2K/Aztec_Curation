var express = require('express');
var router = express.Router();
var insert = require('./api/insert.js');
var APIcontroller = require('./api/api_controller.js');

var Institution = require('../models/mysql/institution.js');
var InstAlias = require('../models/mysql/inst_alias.js');
var InstController = require('./api/query_controller.js')(Institution, InstAlias);

var Language = require('../models/mysql/language.js');
var LangAlias = require('../models/mysql/lang_alias.js');
var LangController = require('./api/query_controller.js')(Language, LangAlias);

var Agency = require('../models/mysql/agency.js');
var AgencyAlias = require('../models/mysql/agency_alias.js');
var AgencyController = require('./api/query_controller.js')(Agency, AgencyAlias);

var Tag = require('../models/mysql/tag.js');
var TagController = require('./api/query_controller.js')(Tag);

var ToolController = require('./api/tool_controller.js');
var SavedController = require('./api/saved_controller.js');


router.get('/', APIcontroller.getHome);

router.get('/institution', InstController.search);

router.get('/language', LangController.search);

router.get('/agency', AgencyController.search);

router.get('/tag', TagController.search);

router.get('/institution/insert', insert.insertInst);

router.get('/language/insert', insert.insertLang);

router.get('/agency/insert', insert.insertAgency);


router.get('/tool/:id', ToolController.searchByID);

router.get('/tool', ToolController.search);

router.get('/saved/:id', SavedController.searchByID);

router.get('/saved', SavedController.getAllTools);





module.exports = router;
