var config = require('config').Application;
var querystring = require("querystring");

var UpdateListResponse = function(id, resultItems, errorMessage) {
	this.id = id;
	this.result = resultItems;
	this.error = errorMessage;
};

var UpdateItem = function(url, timestamp, md5sum, filename, channel, changes, api_level) {
	this.url = url;
	this.timestamp = timestamp;
	this.md5sum = md5sum;
	this.filename = filename;
	this.channel = channel;
	this.changes = changes;
	this.api_level = api_level;
};

module.exports.convert = function(id, errorMessage, updateList) {
	var list = Array();

	if (updateList && updateList.length > 0) {
		updateList.forEach(function(rom) {
			var changelogUrl = module.exports.getChangelogUrl(rom);

			var downloadUrl;

			if (config.isDownloadProxyEnabled) {
				downloadUrl = config.proxyDownloadBaseUrl + '/' + rom.id + '?' + querystring.stringify({ filename : rom.filename });
			} else {
				downloadUrl = module.exports.getRealDownloadUrl(rom);
			}

			var timestampInSeconds = Math.round(rom.timestamp.getTime() / 1000);

			var item = new UpdateItem(downloadUrl, timestampInSeconds, rom.md5sum, rom.filename, rom.updateChannel, changelogUrl, rom.apiLevel);
			list.push(item);
		});
	}

	return new UpdateListResponse(id, list, errorMessage);
}

module.exports.getRealDownloadUrl = function(rom) {
	var url = config.realDownloadBaseUrl;

	if (rom.subdirectory && rom.subdirectory.length > 0) {
		url += '/' + rom.subdirectory;
	}

	url += '/' + rom.filename;

	return url;
}

module.exports.getChangelogUrl = function(rom) {
	return config.changelogBaseUrl + '/' + rom.id;
}

module.exports.getChangelogContent = function(rom) {
	var content = "";

	if (rom.changelog && rom.changelog.length > 0) {
		if (rom.sourceCodeTimestamp && rom.sourceCodeTimestamp > 0) {
			content += "===================================\n";
			content += "Since ";
			content += rom.sourceCodeTimestamp.toUTCString();
			content += "\n===================================\n\n";
		}

		content += rom.changelog;
	}

	return content;
}
