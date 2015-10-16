module.exports = {
  generateSuggestions: function (toolMetadataJson)
  {
	var copyOfJson = JSON.parse(JSON.stringify(toolMetadataJson));

	for (var prop in copyOfJson)
	{
		copyOfJson[prop] = null;
	}

	copyOfJson.DESCRIPTION = "Here is a recommendation for the description.";
	return copyOfJson;
  }
};
