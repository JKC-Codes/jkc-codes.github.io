const parseOptions = require('./src/options-parser.js');
const measureTime = require('./src/measure-time.js');
const validateOptions = require('./src/options-validator.js');

module.exports = function(eleventyConfig, customOptions) {

	const defaultOptions = {
		hour: ['h', 'hr', ' hour'],
		hours: ['h', 'hrs', ' hours'],
		minute: ['m', 'min', ' minute'],
		minutes: ['m', 'mins', ' minutes'],
		second: ['s', 'sec', ' second'],
		seconds: ['s', 'secs', ' seconds'],
		format: '{mmm}',
		quantity: 1000,
		measure: 'characters',
		interval: 'minute'
	};
	const globalOptions = Object.assign({}, defaultOptions, customOptions);

	eleventyConfig.addFilter('time-to-read', function(input, ...instanceOptions) {
		try {
			const options = Object.assign({}, globalOptions, parseOptions(instanceOptions));
			return measureTime(input, options);
		}
		catch(error) {
			throw validateOptions(parseOptions(instanceOptions)) || validateOptions(customOptions) || new Error(error);
		}
	});
}