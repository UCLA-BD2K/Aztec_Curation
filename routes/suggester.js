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
			var request = require('request');
			var xmlParser = require('xml2json');

			var options = {
			  url: 'url'
			};
			options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + JSON.parse(toolMetadataJson).NAME + "&field=title";
			//options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title";
			request(options, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				var responseAsJson = JSON.parse(xmlParser.toJson(body));
				//console.log("pubmed json:");
				//console.log(responseAsJson);
				var bestGuess = 0; //just pick one
				var articleNumber = responseAsJson.eSearchResult.IdList.Id[bestGuess];
				console.log("best article guess:");
				console.log(articleNumber);
				callback("http://www.ncbi.nlm.nih.gov/pubmed/" + articleNumber);
				}
			});
			break;
		case "SOURCE_LINK":
			var request = require('request');

			var options = {
			  url: 'url',
			  headers: {
			    'User-Agent': 'bleakley'
			  }
			};
			options.url = "https://api.github.com/search/repositories?q=" + JSON.parse(toolMetadataJson).NAME;
			request(options, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				var responseAsJson = JSON.parse(body);
				var bestGuess = 1; //just pick one
				var bestGuessURL = responseAsJson.items[bestGuess].html_url;
				var bestGuessDesc = responseAsJson.items[bestGuess].description;
				console.log(bestGuessURL);
				//callback("<a href=\"" + bestGuessURL + "\" target=\"_blank\">" + bestGuessURL + "</a> " + bestGuessDesc);
				callback(bestGuessURL);
			  }
			});
			break;
		default:
			callback(null);
			break;
	}

  }
};







//http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title

