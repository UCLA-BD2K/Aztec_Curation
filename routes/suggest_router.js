var express = require('express');
var router = express.Router();
var suggester = require('./suggester/suggest_controller.js');


router.post('/query', suggester.postQuery);

router.get('/github', suggester.getGithub);

router.get('/pubmed', suggester.getPubmed);

module.exports = router;
