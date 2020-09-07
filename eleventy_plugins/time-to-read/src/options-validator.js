const regEx = require('./regular-expressions.js');

module.exports = function(options) {

	function validateAffixes(optionKey, affix) {
		if(!Array.isArray(affix) || !affix.every(entry => typeof entry === 'string')) {
			throw new Error(`Time-to-read's ${optionKey} option must be an array of strings. Received: '${affix}'`);
		}
	}

	function validateFormat(format) {
		if(typeof format !== 'string' || !new RegExp(regEx.formatVariable,'i').test(format)) {
			throw new Error(`Time-to-read's format option must be a string and contain any number of either h, m or s characters enclosed by {}. Received '${format}'`);
		}
	}

	function validateSpeed(speed) {
		if(!new RegExp(regEx.speed,'i').test(speed)) {
			throw new Error(`Time-to-read's speed option must be a string matching: '(Number) ${regEx.speedMeasure} (optional 'per' or 'a' or 'an') ${regEx.speedInterval}'. Received '${speed}'`);
		}
	}

	for(option in options) {
		switch(option) {
			case 'hour':
			case 'hours':
			case 'minute':
			case 'minutes':
			case 'second':
			case 'seconds':
				validateAffixes(option, options[option]);
			break;

			case 'format':
				validateFormat(options.format);
			break;

			case 'speed':
				validateSpeed(options.speed);
			break;

			default: throw new Error(`Time-to-read encountered an unrecognised option: ${option}`);
		}
	}
}