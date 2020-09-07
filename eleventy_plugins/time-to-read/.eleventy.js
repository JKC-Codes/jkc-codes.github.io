const defaultOptions = require('./src/options-default.js');
const parseOptions = require('./src/options-parser.js');
const measureTime = require('./src/measure-time.js');
const validateOptions = require('./src/options-validator.js');

module.exports = function(eleventyConfig, customOptions) {
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