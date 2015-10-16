

module.exports = {
  generateSuggestion: function (toolMetadataJson,requestedField,callback)
  {
	var copyOfJson = JSON.parse(JSON.stringify(toolMetadataJson));

	for (var prop in copyOfJson)
	{
		copyOfJson[prop] = null;
	}

	if(requestedField == "DESCRIPTION")
	{
		callback("recommended description.");
	}
	else if(requestedField == "SOURCE_LINK")
	{
		callback("github.com/recommended");
	}
	else callback(null);

/*	var request = require('request');

	var options = {
	  url: 'https://api.github.com/search/repositories?q=tetris',
	  headers: {
	    'User-Agent': 'bleakley'
	  }
	};	

	options.url = "https://api.github.com/search/repositories?q=" + toolMetadataJson.NAME;

	request(options, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var responseAsJson = JSON.parse(body);
		var bestURLGuess = responseAsJson.items[0].url;
		console.log(bestURLGuess);
		copyOfJson.SOURCE_LINK = bestURLGuess;
		//return copyOfJson;
	  }
	})

	
	return copyOfJson;*/
  }
};


