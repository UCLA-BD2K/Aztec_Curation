var express = require('express');
var router = express.Router();
var insert = require('./api/insert.js');
var APIcontroller = require('./api/api_controller.js');
var InstController = require('./api/inst_controller.js');

router.get('/', APIcontroller.getHome);

router.get('/institution', InstController.search);

router.get('/institution/insert', insert.insertInst);



module.exports = router;
