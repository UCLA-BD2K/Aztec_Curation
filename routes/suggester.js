module.exports = {
    generateSuggestion: function (toolMetadataJson, requestedField, callback) {
      console.log('inside suggester');
      var tool_name = toolMetadataJson['basic[res_name]'];
        switch (requestedField) {
            case "AZID":
                callback(null);//azid will never change
                break;
            case "NAME":
                callback(null);//name will never change in current implementation
                break;
            case "pub_primary_doi":
                console.log(1);
                var request = require('request');
                var xmlParser = require('xml2json');
                console.log(2);
                var options = {
                    url: 'url'
                };
                //http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=tophat&field=title&retmode=json
                console.log("lets search for ", tool_name);
                options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + tool_name + "&field=title&retmode=json";
                console.log(options.url);
                //options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title";
                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var responseAsJson = JSON.parse(body);
						var numberOfHits = responseAsJson.esearchresult.idlist.length;
                        var articleNumber = responseAsJson.esearchresult.idlist[numberOfHits-1];

						var articleQueryString = responseAsJson.esearchresult.idlist[0];

						for(var i = 1; i < numberOfHits; i++)
						{
							articleQueryString += "+" + responseAsJson.esearchresult.idlist[i];
						}

                        var secondQueryURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + articleQueryString;

						//search all the titles for one that matches the pattern <tool name>: <more text>
                        console.log(secondQueryURL);
                        request(secondQueryURL, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var responseAsJson = JSON.parse(body);
								var UIDs = responseAsJson.result.uids;

								//console.log(body);
								var shortList = [];

								for(var i = 0; i < UIDs.length; i++)
								{
									//console.log(UIDs[i].title);
									if(responseAsJson.result[UIDs[i]].title.indexOf(":") >= 0)
										if(responseAsJson.result[UIDs[i]].title.split(":")[0].toUpperCase() === tool_name.toUpperCase())
										{
											console.log("Found an article that starts with the tool name.");
											shortList.push(UIDs[i]);
										}
								}

								var suggestionPMID = "0";
								if(shortList.length == 0)
								{
									var abstractQueryURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=" + articleQueryString + "&retmode=text&rettype=abstract";
									//get the abstracts and check for key words http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=1+2&retmode=json&rettype=title"
									request(abstractQueryURL, function (error, response, body) {
						                if (!error && response.statusCode == 200) {

											//first, separate the abstracts
											var abstractPMIDs = body.match('PMID: ([0-9]+)  \\[[a-zA-Z \\-]+\\]');
											var abstracts = body.split('PMID: ([0-9]+)  \\[[a-zA-Z \\-]+\\]');

											console.log(abstracts);

											var urlRegex = '(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?';
											//should we check for a url in the abstract?

											//keywords should be searched in order
											var keywords = ["SOFTWARE", "TOOL", "SCRIPT", "ALGORITHM", "RESOURCE", "PROGRAM"];
											//for each keyword (in order) go through each abstract in reverse order looking for the keyword
											//as soon as a match is found, return it

											for(var i = 0; i < keywords.length; i++)
											{
												for(var j = abstracts.length - 1; j >= 0; j--)
												{
													//console.log("abstract " + j + ":\n" + abstracts[j]);
													if(abstracts[j].toUpperCase().indexOf(keywords[i]) >= 0)
													{


														console.log("Found an article containing the keyword " + keywords[i]);
														//WARNING: is this always the correct article number?
												        var title = responseAsJson.result[articleNumber].title;
												        console.log("title:");
												        console.log(title);

												        var response = {
												            suggestedDescription: title,
												            suggestedUrl: "http://www.ncbi.nlm.nih.gov/pubmed/" + articleNumber
												        }
												        callback(JSON.stringify(response));
												        return;
													}
												}
											}

											console.log("Returning the earliest article with tool name in title.");
						                    //WARNING: is this always the correct article number?
						                    var title = responseAsJson.result[articleNumber].title;
						                    console.log("title:");
						                    console.log(title);

						                    var response = {
						                        suggestedDescription: title,
						                        suggestedUrl: "http://www.ncbi.nlm.nih.gov/pubmed/" + articleNumber
						                    }
						                    callback(JSON.stringify(response));
						                    return;
						                }
						            });

								}
								else
								{
									console.log("Multiple article titles start with the tool name. Returning the earliest one.");

		                            //WARNING: is this always the correct article number?
		                            var title = responseAsJson.result[articleNumber].title;
		                            console.log("title:");
		                            console.log(title);

		                            var response = {
		                                suggestedDescription: title,
		                                suggestedUrl: "http://www.ncbi.nlm.nih.gov/pubmed/" + articleNumber
		                            }
		                            callback(JSON.stringify(response));
		                            return;
                                }
                            }
                        });

						/*request(abstractQueryURL, function (error, response, body) {
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
                        });*/

                    }
                });
                break;
            case "res_code_url":
                var request = require('request');

                var options = {
                    url: 'url',
                    headers: {
                        'User-Agent': 'bleakley',
                        'Accept': 'application/vnd.github.drax-preview+json'
                    }
                };
				var langs = toolMetadataJson['dev[dev_lang]'];
				var langAddOn = "";

				if(langs.length > 0)
					langAddOn += "+language:" + langs[0].lang_name;

                options.url = "https://api.github.com/search/repositories?q=" + tool_name + langAddOn;
                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var responseAsJson = JSON.parse(body);
                        var bestGuess = 0; //just pick the first one to start with

                        if(responseAsJson.total_count == 0)
                        {
                        	var response = {
                            	message: "No suggestion"
                        	}
                        	callback(JSON.stringify(response));
                        	//check again without the language filter?
                        	return;
                        }

                        for(var i = 0; i < responseAsJson.total_count; i++)
                        {
                        	//prioritize one with an identical name
                        	if(responseAsJson.items[i].name.toUpperCase() === tool_name.toUpperCase())
                        	{
                        		bestGuess = i;
                        		break;
                        	}

                        	//check the readme for keywords?
                        	var file_path = "https://raw.githubusercontent.com/" + responseAsJson.items[i].full_name + "/master/";
                        	//get more information (licenses)
                        	var details_url = "https://api.github.com/repos/" + responseAsJson.items[i].full_name;
                        	//get user info
                        	var user_url = responseAsJson.items[i].owner.url;

                        	//auth token
                        	//778642b75edd2892c2871963cc7ed16c4a0d1e0f
                        }


                        var bestGuessURL = responseAsJson.items[bestGuess].html_url;
                        var bestGuessDesc = responseAsJson.items[bestGuess].description;
                        console.log(bestGuessURL);
                        var response = {
                            suggestedDescription: bestGuessDesc,
                            suggestedUrl: bestGuessURL
                        }
                        //callback("<a href=\"" + bestGuessURL + "\" target=\"_blank\">" + bestGuessURL + "</a> " + bestGuessDesc);
                        callback(JSON.stringify(response));
                    }
                });

                //testing license
                /*options.url = "https://api.github.com/search/repositories?q=" + tool_name + langAddOn;
                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var responseAsJson = JSON.parse(body);
                        var bestGuess = 0; //just pick the first one to start with


                        for(var i = 0; i < responseAsJson.total_count; i++)
                        {
                        	//prioritize one with an identical name
                        	if(responseAsJson.items[i].name.toUpperCase() === tool_name.toUpperCase())
                        	{
                        		bestGuess = i;
                        		break;
                        	}

                        	var file_path = "https://raw.githubusercontent.com/" + responseAsJson.items[i].full_name + "/master/";
                        	var path1 = file_path + "README";
                        	var path2 = file_path + "README.md";

                        }


                        var bestGuessURL = responseAsJson.items[bestGuess].html_url;
                        var bestGuessDesc = responseAsJson.items[bestGuess].description;
                        console.log(bestGuessURL);
                        var response = {
                            suggestedDescription: bestGuessDesc,
                            suggestedUrl: bestGuessURL
                        }
                        //callback("<a href=\"" + bestGuessURL + "\" target=\"_blank\">" + bestGuessURL + "</a> " + bestGuessDesc);
                        callback(JSON.stringify(response));
                    }
                });*/


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
                        callback(response);
                    }
                });

            }
        });
    }



};


//http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title
