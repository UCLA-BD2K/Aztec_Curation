var express = require('express');
var router = express.Router();

var Institution = require('../models/mysql/institution.js');
var InstAlias = require('../models/mysql/inst_alias.js');
var InstController = new (require('../controllers/query-controller.js'))(Institution, InstAlias);

var Language = require('../models/mysql/language.js');
var LangAlias = require('../models/mysql/lang_alias.js');
var LangController = new (require('../controllers/query-controller.js'))(Language, LangAlias);

var Agency = require('../models/mysql/agency.js');
var AgencyAlias = require('../models/mysql/agency_alias.js');
var AgencyController = new (require('../controllers/query-controller.js'))(Agency, AgencyAlias);

var Tag = require('../models/mysql/tag.js');
var TagController = new (require('../controllers/query-controller.js'))(Tag);

var ToolController = require('../controllers/tool-controller');
var UserController = require('../controllers/user-controller.js');
var InsertController = require('../controllers/insert-controller');


router.get('/institution', InstController.search);

router.get('/language', LangController.search);

router.get('/agency', AgencyController.search);

router.get('/tag', TagController.search);

router.get('/institution/insert', InsertController.institution);

router.get('/language/insert', InsertController.language);

router.get('/agency/insert', InsertController.agency);

router.get('/tool/:id', ToolController.formApi);

router.get('/tool/v1/:id', ToolController.restApi);

router.get('/tool', ToolController.showAll);

router.get('/saved/:id', UserController.getSavedAPI);

router.get('/saved', UserController.getAllSaved);





module.exports = router;
