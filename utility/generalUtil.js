var crypto = require('crypto');

function GeneralUtil(){};

GeneralUtil.encrypt = function (key, message) {
    var algorithm = 'aes256';

    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
};

GeneralUtil.decrypt = function (key, message) {
	var algorithm = 'aes256';
	var decipher = crypto.createDecipher(algorithm, key);
	var decrypted = decipher.update(message, 'hex', 'utf8') + decipher.final('utf8');
	return decrypted;
};

module.exports = GeneralUtil;
