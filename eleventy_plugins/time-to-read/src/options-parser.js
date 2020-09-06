const regEx = require('./regular-expressions.js');
const validateOptions = require('./options-validator.js');

module.exports = function(customOptions) {
	// Create object from customInstanceOptions array
	const options = {};
	customOptions.forEach(option => {
		// Regex = '{' + 0 or more numbers + 1 or more 'h', 'm' or 's' + '}'
		if(new RegExp(`${regEx.formatVariable}`,'i').test(option)) {
			options.format = option;
		}
		else if(new RegExp(`${regEx.speed}`,'i').test(option)) {
			options.speed = option;
		}
		else {
			validateOptions(customOptions);
		}
	})
	return options;
}