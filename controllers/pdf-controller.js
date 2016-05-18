var waitTime = 5000;
var stripAnsi = require('strip-ansi');
function Uploader(){
	var self = this; 
	self.upload = function(req, res){ self._upload(self, req, res); };
  self.delete_file = function(req, res){ self._delete_file(self, req, res); };
}



Uploader.prototype._upload = function(self, req, res){
  // test
  console.log("User is");
  console.log(req.user);
// pass the req.user object to the shell script in order to make specific folders and delete specific folders
  if(req.file){
  	var exec = require('child_process').exec;
  	var puts = ""; 
  	const execFile = require('child_process').execFile;
    // make this path relative too.
	const child = execFile('bash', ['/Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/scripts/getting_started.sh'], (error, stdout, stderr) => {
  if (error) {
    // console.log(error);
  }
    var a = JSON.stringify(stripAnsi(stdout), null, 3);
    res.json(JSON.parse(a));

    });
  }	
};

Uploader.prototype._delete_file = function(self, req, res){
  var exec = require('child_process').exec;
  const execFile = require('child_process').execFile;
    const child = execFile('bash', ['/Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/scripts/delete_file.sh'], (error, stdout, stderr) => {
  if (error) {
  }
      console.log(stdout);
  });  

}

module.exports = new Uploader();