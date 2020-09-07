const regEx = require('./regular-expressions.js');

module.exports = function(customOptions) {
	// Create object from instance options array
	const options = {};
	customOptions.forEach(option => {
		if(new RegExp(regEx.formatVariable,'i').test(option)) {
			options.format = option;
		}
		else if(new RegExp(regEx.speed,'i').test(option)) {
			options.speed = option;
		}
		else {
			throw new Error(`Time-to-read encountered an unrecognised option: ${option}`);
		}
	})
	return options;
}