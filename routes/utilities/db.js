var Tool = require('../../models/mysql/tool.js');
var ToolMisc = require('../../models/mongo/toolMisc.js');
var convert = require('../utilities/convert.js');

module.exports = {
  searchToolByID: function(id, cb){
    Tool.forge()
      .where({AZID: id})
      .fetchAll({withRelated: ['domains', 'license', 'platform', 'tags', 'resource_types', 'languages', 'institutions', 'centers']})
      .then(function(i){
        var thisTool = i;
        ToolMisc.findOne({azid: id}, function(err, misc){
          if (err || thisTool.length==0){
            var response = {
              status  : 'error',
              error   : id+' not found'
            }
            return cb(response);
          }

          var returnTool = thisTool.toJSON()[0];

          //console.log('tool',thisTool.toJSON());

          if(misc!=undefined && misc!=null){
            //console.log('misc', misc);

            returnTool.authors = misc.authors;
            returnTool.maintainers = misc.maintainers;
            returnTool.links = misc.links;
            returnTool.funding = misc.funding;
            returnTool.version = misc.versions;
            returnTool.publications = misc.publications;

            misc.missing_inst.forEach(function(inst){
              returnTool.institutions.push(inst);
            });
            console.log(returnTool);
          }
          var result = convert.convert2readable(returnTool);
          return cb(result);
        });
      })
      .catch(function(err){
        var response = {
          status  : 'error',
          error   : JSON.stringify(err)
        }
        return cb(response);
      });
    }
};
