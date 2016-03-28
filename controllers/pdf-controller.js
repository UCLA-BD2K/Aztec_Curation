var waitTime = 3000;
function Uploader(){
	var self = this; 
	self.upload = function(req, res){ self._upload(self, req, res); };
}

Uploader.prototype._upload = function(self, req, res){
  console.log("The file should be in uploads");
  setTimeout(function(){
	res.json(
		{"name": "Test",
		"authors": ["John Doe", "Jane Doe"],
		"source_code": "github.com/test",
		"keywords": ["word1", "word2", "word3"],
		"funding": ["funding1", "funding2"]
		});
  },waitTime);

};

module.exports = new Uploader();