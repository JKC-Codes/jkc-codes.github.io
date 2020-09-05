const parseOptions = require('./src/parse-options.js');
const measureTime = require('./src/measure-time.js');

module.exports = function(eleventyConfig, customOptions) {

	const defaultOptions = {
		hour: ' hour',
		hours: ' hours',
		minute: ' minute',
		minutes: ' minutes',
		second: ' second',
		seconds: ' seconds',
		format: 'm',
		quantity: 1000,
		measure: 'characters',
		interval: 'minute'
	};
	const globalOptions = Object.assign({}, defaultOptions, parseOptions(customOptions));

	eleventyConfig.addFilter('time-to-read', function(input, ...instanceOptions) {
		const options = Object.assign({}, globalOptions, parseOptions(instanceOptions));
		return measureTime(input, options);
	});
}