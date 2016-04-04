var getMaintainerFromGitHub = function(githubUserName, callback) {

  var options = {
    url: 'https://api.github.com/users/' + githubUserName,
    headers: {
      'User-Agent': '788825ca7dd165a3393e490fe4aa066f4b370dcc',
      'Accept': 'application/vnd.github.drax-preview+json'
    }
  };

  var request = require('request');
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {

      var responseAsJson = JSON.parse(body);

      var maintainer = {};

      var maintainerFound = false;

      if (responseAsJson.name != null) {
        maintainer.maintainer_name = responseAsJson.name;
        maintainerFound = true;
      }
      if (responseAsJson.email != null) {
        maintainer.maintainer_email = responseAsJson.email;
        maintainerFound = true;
      }

      var response = {};

      if (!maintainerFound) {
        response.message = "No maintainer found.";
      } else {
        response.suggestedMaintainer = maintainer;
      }

      callback(response);
    }
  });

};

var getReleasesFromGitHub = function(githubRepoName, callback) {

  var options = {
    url: 'https://api.github.com/repos/' + githubRepoName + '/releases',
    headers: {
      'User-Agent': '788825ca7dd165a3393e490fe4aa066f4b370dcc',
      'Accept': 'application/vnd.github.drax-preview+json'
    }
  };

  var request = require('request');
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {

      var responseAsJson = JSON.parse(body);
      var ourResponse = {};

      if (responseAsJson.length == 0) {
        ourResponse.message = "No releases found.";
        callback(ourResponse);
        return;
      }


      var releases = [];

      for (var i = 0; i < responseAsJson.length; i++) {
        var rel = {};
        rel.version_number = responseAsJson[i].name;
        rel.version_date = responseAsJson[i].published_at;
        releases.push(rel);
      }

      ourResponse.suggestedReleases = releases;

      callback(ourResponse);
    }
  });

};

//here
var getLicenseFromGitHub = function(githubRepoName, callback) {

  var options = {
    url: 'https://api.github.com/repos/' + githubRepoName,
    headers: {
      'User-Agent': '788825ca7dd165a3393e490fe4aa066f4b370dcc',
      'Accept': 'application/vnd.github.drax-preview+json'
    }
  };

  var request = require('request');
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {

      var license = JSON.parse(body).license;

      var ourResponse = {};

      if (license == undefined) {
        ourResponse.suggestedLicense = "No license found.";
      } else {
        ourResponse.suggestedLicense = license.name;
      }

      callback(ourResponse);
    }
  });

};

var getSourceUrlFromGitHub = function(toolMetadataJson, callback) {

  var request = require('request');

  var options = {
    url: 'url',
    headers: {
      'User-Agent': '788825ca7dd165a3393e490fe4aa066f4b370dcc',
      'Accept': 'application/vnd.github.drax-preview+json'
    }
  };
  var langs = [];
  if (toolMetadataJson.dev != undefined && toolMetadataJson.dev.language != undefined)
    langs = toolMetadataJson.dev.language;

  var langAddOn = "";
  if (langs.length > 0)
    langAddOn += "+language:" + langs[0].PRIMARY_NAME;
  var tool_name = toolMetadataJson.basic.name;

  options.url = "https://api.github.com/search/repositories?q=" + tool_name + langAddOn;
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var responseAsJson = JSON.parse(body);
      var bestGuess = 0; //just pick the first one to start with

      if (responseAsJson.total_count == 0) {
        var response = {
          message: "No suggestion"
        }
        callback(JSON.stringify(response));
        //check again without the language filter?
        return;
      }

      for (var i = 0; i < responseAsJson.total_count; i++) {
        //prioritize one with an identical name
        if (responseAsJson.items[i].name.toUpperCase() === tool_name.toUpperCase()) {
          bestGuess = i;
          break;
        }

        //check the readme for keywords?
        //var file_path = "https://raw.githubusercontent.com/" + responseAsJson.items[i].full_name + "/master/";
        //get more information (licenses)
        //var details_url = "https://api.github.com/repos/" + responseAsJson.items[i].full_name;
        //get user info
        //var user_url = responseAsJson.items[i].owner.url;
        //get release info
        //var details_url = "https://api.github.com/repos/" + responseAsJson.items[i].full_name + "/releases";

      }

      var bestGuessURL = responseAsJson.items[bestGuess].html_url;
      var bestGuessDesc = responseAsJson.items[bestGuess].description;
      var bestGuessLang = responseAsJson.items[bestGuess].language;
      var bestGuessLink = {
        "link_name": "home",
        "link_url": responseAsJson.items[bestGuess].homepage
      }
      console.log(bestGuessURL);
      var response = {
        suggestedDescription: bestGuessDesc,
        suggestedUrl: bestGuessURL
      }
      console.log(response);
      if (bestGuessLang != null)
        response.suggestedLang = bestGuessLang;

      if (bestGuessLink.link_url != null && bestGuessLink.link_url != "")
        response.suggestedLink = bestGuessLink;

      //callback("<a href=\"" + bestGuessURL + "\" target=\"_blank\">" + bestGuessURL + "</a> " + bestGuessDesc);
      callback(response);
    }
  });

};

var searchCrossRef = function(toolMetadataJson, callback) {

  var request = require('request');
  var options = {};
  options.url = "http://search.crossref.org/dois?q=";
  var md = toolMetadataJson;
  var name = md.basic.name.replace(" ", "+");
  options.url += name;
  if(md.authors.authors!=undefined){
    for (var i = 0; i < md.authors.authors.length; i++) {
      var aname = md.authors.authors[i].first_name.replace(" ", "+")+'+'+md.authors.authors[i].last_name.replace(" ", "+");
      options.url += "+" + aname;
    }
  }
  console.log(options.url);
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var crossrefMD = JSON.parse(body);
      var bestGuess = 0;

      if (crossrefMD.length == 0) {
        console.log("No hits on Crossref");
        var response = {
          message: "No suggestion"
        }
        callback(JSON.stringify(response));
        return;
      }

      for (var i = 0; i < crossrefMD.length; i++) {
        if (crossrefMD[i].title.indexOf(":") >= 0)
          if (crossrefMD[i].title.split(":")[0].toUpperCase() === toolMetadataJson.basic.name.toUpperCase()) {
            console.log("Found an article that starts with the tool name.");
            console.log(crossrefMD[i].title);
            bestGuess = i;
            break;
          }
      }
      var response = {
        suggestedDescription: crossrefMD[bestGuess].fullCitation,
        suggestedUrl: crossrefMD[bestGuess].doi
      }
      callback(response);
    }
  });
}

var getPublicationInfoFromPubmed = function(toolMetadataJson, callback) {

  var request = require('request');
  var xmlParser = require('xml2json');

  //pass the response through every function
  //add to suggested data through every function
  var response = {
    original_data: toolMetadataJson
  };

  var options = {
    url: 'url'
  };
  //http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=tophat&field=title&retmode=json
  console.log("lets search for " + toolMetadataJson.basic.name);
  options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + toolMetadataJson.basic.name + "&field=title&retmode=json";
  console.log(options.url);
  //options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title";
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var responseAsJson = JSON.parse(body);
      var numberOfHits = responseAsJson.esearchresult.idlist.length;
      var articleNumber = responseAsJson.esearchresult.idlist[numberOfHits - 1];

      var articleQueryString = responseAsJson.esearchresult.idlist[0];

      if (numberOfHits == 0) {
        console.log("No hits on Pubmed. Searching Crossref.");
        searchCrossRef(toolMetadataJson, callback);
        return;
      }

      for (var i = 1; i < numberOfHits; i++) {
        articleQueryString += "+" + responseAsJson.esearchresult.idlist[i];
      }

      var secondQueryURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + articleQueryString;

      //search all the titles for one that matches the pattern <tool name>: <more text>
      console.log(secondQueryURL);
      request(secondQueryURL, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var responseAsJson = JSON.parse(body);
          var UIDs = responseAsJson.result.uids;

          //console.log(body);
          var shortList = [];

          for (var i = 0; i < UIDs.length; i++) {
            //console.log(UIDs[i].title);
            if (responseAsJson.result[UIDs[i]].title.indexOf(":") >= 0)
              if (responseAsJson.result[UIDs[i]].title.split(":")[0].toUpperCase() === toolMetadataJson.basic.name.toUpperCase()) {
                console.log("Found an article that starts with the tool name.");
                shortList.push(UIDs[i]);
              }
          }

          var suggestionPMID = "0";
          if (shortList.length == 0) {
            var abstractQueryURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=" + articleQueryString + "&retmode=text&rettype=abstract";
            //get the abstracts and check for key words http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=1+2&retmode=json&rettype=title"
            request(abstractQueryURL, function(error, response, body) {
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

                for (var i = 0; i < keywords.length; i++) {
                  for (var j = abstracts.length - 1; j >= 0; j--) {
                    //console.log("abstract " + j + ":\n" + abstracts[j]);
                    if (abstracts[j].toUpperCase().indexOf(keywords[i]) >= 0) {


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

          } else {
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

}

module.exports = {

  generateSuggestion: function(toolMetadataJson, requestedField, callback) {
    console.log("in generate suggestion", requestedField);
    switch (requestedField) {
      case "AZID":
        callback(null); //azid will never change
        break;
      case "NAME":
        callback(null); //name will never change in current implementation
        break;
      case "license":
        var githubRepoName = toolMetadataJson.dev.code_url;
        if (githubRepoName != null) {
          githubRepoName = githubRepoName.split("/");
          githubRepoName = githubRepoName[3] + '/' + githubRepoName[4];
        }

        if (githubRepoName != null) {
          getLicenseFromGitHub(githubRepoName, function(jsonResponse) {
            callback(JSON.stringify(jsonResponse));
          });
        } else {
          getSourceUrlFromGitHub(toolMetadataJson, function(jsonResponse) {
            if (jsonResponse.suggestedUrl != null) {

              var githubRepoName = jsonResponse.suggestedUrl;
              if (githubRepoName != null) {
                githubRepoName = githubRepoName.split("/");
                githubRepoName = githubRepoName[3] + '/' + githubRepoName[4];
              }


              getLicenseFromGitHub(githubRepoName, function(jsonResponse) {
                callback(JSON.stringify(jsonResponse));
              });
            }
            //callback(JSON.stringify(jsonResponse.suggestedLink));
          });
        }
        break;
      case "versions":
        var githubRepoName = toolMetadataJson.dev.code_url;
        if (githubRepoName != null) {
          githubRepoName = githubRepoName.split("/");
          githubRepoName = githubRepoName[3] + '/' + githubRepoName[4];
        }

        if (githubRepoName != null) {
          getReleasesFromGitHub(githubRepoName, function(jsonResponse) {
            callback(JSON.stringify(jsonResponse));
          });
        } else {
          getSourceUrlFromGitHub(toolMetadataJson, function(jsonResponse) {
            if (jsonResponse.suggestedUrl != null) {

              var githubRepoName = jsonResponse.suggestedUrl;
              if (githubRepoName != null) {
                githubRepoName = githubRepoName.split("/");
                githubRepoName = githubRepoName[3] + '/' + githubRepoName[4];
              }


              getReleasesFromGitHub(githubRepoName, function(jsonResponse) {
                callback(JSON.stringify(jsonResponse));
              });
            }
            //callback(JSON.stringify(jsonResponse.suggestedLink));
          });
        }
        break;
      case "maintainers":

        var githubUserName = toolMetadataJson.dev.code_url;
        if (githubUserName != null) {
          githubUserName = githubUserName.split("/");
          githubUserName.pop();
          githubUserName = githubUserName.pop();
        }

        if (githubUserName != null) {
          getMaintainerFromGitHub(githubUserName, function(jsonResponse) {
            callback(JSON.stringify(jsonResponse));
          });
        } else {
          getSourceUrlFromGitHub(toolMetadataJson, function(jsonResponse) {
            if (jsonResponse.suggestedUrl != null) {

              var githubUserName = jsonResponse.suggestedUrl;
              if (githubUserName != null) {
                githubUserName = githubUserName.split("/");
                githubUserName.pop();
                githubUserName = githubUserName.pop();
              }


              getMaintainerFromGitHub(githubUserName, function(jsonResponse) {
                callback(JSON.stringify(jsonResponse));
              });
            }
            //callback(JSON.stringify(jsonResponse.suggestedLink));
          });
        }

        break;
      case "res_code_url":
        console.log("in switch");
        getSourceUrlFromGitHub(toolMetadataJson, function(jsonResponse) {
          console.log("in callback");
          callback(jsonResponse);
        });

        break;
      case "pub_primary_doi":
        console.log(toolMetadataJson);
        getPublicationInfoFromPubmed(toolMetadataJson, function(jsonResponse) {
          console.log("in callback");
          callback(jsonResponse);
        });
        //searchCrossRef(toolMetadataJson, function(jsonResponse) {
        //	console.log("in callback");
        //	callback(jsonResponse);
        //});

        break;
      default:
        callback(null);
        break;
    }

  },


  githubSuggestion: function(name, callback) {
    var request = require('request');

    var options = {
      url: 'url',
      headers: {
        'User-Agent': '788825ca7dd165a3393e490fe4aa066f4b370dcc'
      }
    };
    options.url = "https://api.github.com/search/repositories?q=" + name;
    request(options, function(error, response, body) {
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
            suggestedAuthor: bestGuessAuthor,
            suggestedUrl: bestGuessURL
          }
          //callback("<a href=\"" + bestGuessURL + "\" target=\"_blank\">" + bestGuessURL + "</a> " + bestGuessDesc);
        callback(JSON.stringify(response));
      }
    });
  },

  pubmedSuggestion: function(name, callback) {
    var request = require('request');
    var xmlParser = require('xml2json');

    var options = {
      url: 'url'
    };
    options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + name + "&field=title&rettype=abstract";
    //options.url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=RchyOptimyx&field=title";
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var responseAsJson1 = JSON.parse(xmlParser.toJson(body));
        var bestGuess = 0; //just pick one
        var articleNumber = responseAsJson1.eSearchResult.IdList.Id[bestGuess];


        var secondQueryURL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + articleNumber;
        console.log(secondQueryURL);
        request(secondQueryURL, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var responseAsJson2 = JSON.parse(body); //searchCrossRef
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
