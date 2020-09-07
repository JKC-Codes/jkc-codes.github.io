const regEx = require('./regular-expressions.js');

module.exports = function(customOptions) {
	// Create object from customInstanceOptions array
	const options = {};
	customOptions.forEach(option => {
		if(`/${regEx.formatVariable}/i`.test(option)) {
			options.format = option;
		}
		else if(`/${regEx.speed}/i`.test(option)) {
			options.speed = option;
		}
		else {
			throw new Error(`Time-to-read encountered an unrecognised option: ${option}`);
		}
	})
	return options;
}