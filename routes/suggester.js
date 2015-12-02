module.exports = {
    generateSuggestion: function (toolMetadataJson, requestedField, callback) {
        switch (requestedField) {
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
                options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + JSON.parse(toolMetadataJson).NAME + "&field=title&rettype=abstract";
                //options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title";
                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var responseAsJson = JSON.parse(xmlParser.toJson(body));
                        var bestGuess = 0; //just pick one
                        var articleNumber = responseAsJson.eSearchResult.IdList.Id[bestGuess];


                        var secondQueryURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + articleNumber;
                        console.log(secondQueryURL);
                        request(secondQueryURL, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var responseAsJson = JSON.parse(body);
                                //WARNING: is this always the correct article number?
                                var title = responseAsJson.result[articleNumber].title;
                                console.log("title:");
                                console.log(title);

                                var response = {
                                    suggestedDescription: title,
                                    suggestedUrl: "http://www.ncbi.nlm.nih.gov/pubmed/" + articleNumber
                                }
                                callback(JSON.stringify(response));
                            }
                        });

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
                        var response = {
                            suggestedDescription: bestGuessDesc,
                            suggestedUrl: bestGuessURL
                        }
                        //callback("<a href=\"" + bestGuessURL + "\" target=\"_blank\">" + bestGuessURL + "</a> " + bestGuessDesc);
                        callback(JSON.stringify(responseAsJson));
                    }
                });
                break;
            default:
                callback(null);
                break;
        }

    },


    githubSuggestion: function (name, callback) {
        var request = require('request');

        var options = {
            url: 'url',
            headers: {
                'User-Agent': 'bleakley'
            }
        };
        options.url = "https://api.github.com/search/repositories?q=" + name;
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var responseAsJson = JSON.parse(body);
                var bestGuess = 0; //just pick one
                var bestGuessURL = responseAsJson.items[bestGuess].html_url;
                var bestGuessDesc = responseAsJson.items[bestGuess].description;
                var bestGuessName = responseAsJson.items[bestGuess].name;
                var bestGuessAuthor = responseAsJson.items[bestGuess].owner.login;
                console.log(bestGuessURL);
                var response = {
                    suggestedName: bestGuessName,
                    suggestedDescription: bestGuessDesc,
                    suggestedAuthor:bestGuessAuthor,
                    suggestedUrl: bestGuessURL
                }
                //callback("<a href=\"" + bestGuessURL + "\" target=\"_blank\">" + bestGuessURL + "</a> " + bestGuessDesc);
                callback(JSON.stringify(response));
            }
        });
    },

    pubmedSuggestion: function (name, callback) {
        var request = require('request');
        var xmlParser = require('xml2json');

        var options = {
            url: 'url'
        };
        options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + name + "&field=title&rettype=abstract";
        //options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title";
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var responseAsJson1 = JSON.parse(xmlParser.toJson(body));
                var bestGuess = 0; //just pick one
                var articleNumber = responseAsJson1.eSearchResult.IdList.Id[bestGuess];


                var secondQueryURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + articleNumber;
                console.log(secondQueryURL);
                request(secondQueryURL, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var responseAsJson2 = JSON.parse(body);
                        //WARNING: is this always the correct article number?
                        var title = responseAsJson2.result[articleNumber].title;
                        var authors = responseAsJson2.result[articleNumber].authors;
                        var doi = responseAsJson2.result[articleNumber].articleids[0].value;
                        var pubmedID = responseAsJson2.result[articleNumber].articleids[2].value;

                        console.log("title:");
                        console.log(title);
                        console.log("authors:");
                        console.log(authors);
                        console.log("doi:");
                        console.log(doi);
                        console.log("pubmedID:");
                        console.log(pubmedID);

                        var response = {
                            suggestedDescription: title,
                            suggestedUrl: "http://www.ncbi.nlm.nih.gov/pubmed/" + articleNumber,
                            suggestedAuthors: authors,
                            suggestedDOI: doi,
                            suggestedPubmedID: pubmedID
                        }
                        callback(JSON.stringify(response));
                    }
                });

            }
        });
    }



};


//http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title
