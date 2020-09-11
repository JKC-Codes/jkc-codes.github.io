const defaultOptions = require('./src/options-default.js');
const validateOptions = require('./src/options-validator.js');
const parseOptions = require('./src/options-parser.js');
const measureTime = require('./src/measure-time.js');

module.exports = function(eleventyConfig, customOptions) {
	const globalOptions = Object.assign({}, defaultOptions, validateOptions(customOptions));
	eleventyConfig.addFilter('time-to-read', function(input, ...instanceOptions) {
		const options = Object.assign({}, globalOptions, parseOptions(instanceOptions));
		return measureTime(input, options);
	});
}