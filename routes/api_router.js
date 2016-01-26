var express = require('express');
var router = express.Router();
var insert = require('./api/insert.js');
var APIcontroller = require('./api/api_controller.js');
var InstController = require('./api/inst_controller.js');
var LangController = require('./api/lang_controller.js');
var TagController = require('./api/tag_controller.js');
var ToolController = require('./api/tool_controller.js');

router.get('/', APIcontroller.getHome);

router.get('/institution', InstController.search);

router.get('/language', LangController.search);

router.get('/tag', TagController.search);

router.get('/institution/insert', insert.insertInst);

router.get('/language/insert', insert.insertLang);


router.get('/tool/:id', ToolController.searchByID);

router.get('/tool', ToolController.search);





module.exports = router;
