module.exports = {
  generateSuggestion: function (toolMetadataJson,requestedField,callback)
  {
	switch(requestedField)
	{
		case "AZID":
			callback(null);//azid will never change
			break;
		case "NAME":
			callback(null);//name will never change in current implementation
			break;
		case "PRIMARY_PUB_LINK":
			callback("pubmed.org/recommended");
			break;
		case "SOURCE_LINK":
			var request = require('request');

			var options = {
			  url: 'https://api.github.com/search/repositories?q=tetris',
			  headers: {
			    'User-Agent': 'bleakley'
			  }
			};
			options.url = "https://api.github.com/search/repositories?q=" + JSON.parse(toolMetadataJson).NAME;
			request(options, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				var responseAsJson = JSON.parse(body);
				var bestURLGuess = responseAsJson.items[0].url;//just pick the first one
				console.log(bestURLGuess);
				callback(bestURLGuess);
			  }
			});
			break;
		default:
			callback(null);
			break;
	}

  }
};


