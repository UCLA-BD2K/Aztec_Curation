module.exports = {
  unflatten: function(data) {
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
  },
  removeHash: function(json){
    if(json==undefined)
      return [];
    json = json.map(function(obj){
      delete obj['$$hashKey'];
      return obj;
    });
    return json;
  }
};
