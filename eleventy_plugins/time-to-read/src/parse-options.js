module.exports = function(customOptions) {

	let options = customOptions;
	const regExQuantity = String.raw`[0-9]+`; // Regex = 1 or more numbers
	const regExMeasure = String.raw`(characters|words)`;
	const regExInterval = String.raw`(hour|minute|second)`;
	// Regex = quantity + space + measure + space + optional 'per ' or 'a ' + interval
	const regExSpeed = new RegExp(`^${regExQuantity} ${regExMeasure} ((per|a) )?${regExInterval}$`, 'i');

	// Create object from instance's options array
	if(Array.isArray(customOptions)) {
		options = {};
		customOptions.forEach(option => {
			if(option.match(regExSpeed)) {
				options.speed = option;
			}
			else {
				options.format = option;
			}
		})
	}

	// Validate options
	function validateAffixes(key, value) {
		if(typeof value === 'string') {
			value = [value];
			return;
		}
		else if(
			Array.isArray(value) && value.every(entry => typeof entry === 'string')) {
			return;
		}
		else {
			throw new Error(`Time-to-read's ${key} option must be a string or array of strings`);
		}
	}

	function validateFormat(key, value) {

	}

	function validateSpeed(key, value) {
		if(!value.match(regExSpeed)) {
			throw new Error(`Time-to-read's ${key} option must be a string matching: '(Number) ${regExMeasure} (optional 'per' or 'a') ${regExInterval}'. Received '${value}'`);
		}
	}

	function addFormatKeys() {

	}

	function addSpeedKeys() {

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
				validateFormat(option, options[option]);
				addFormatKeys();
			break;

			case 'speed':
				validateSpeed(option, options[option]);
				addSpeedKeys();
			break;

			default: throw new Error(`Time-to-read found unrecognised option: ${option}`);
		}
	}

	return options;

}

/*

Desired format:
	{
		hour: ['h', 'hr', ' hour'],
		hours: ['h', 'hrs', ' hours'],
		minute: ['m', 'min', ' minute'],
		minutes: ['m', 'mins', ' minutes'],
		second: ['s', 'sec', ' second'],
		seconds: ['s', 'secs', ' seconds'],
		format: 'mmm',
		quantity: 1000,
		measure: 'characters',
		interval: 'minute'
	}


	Possible inputs:

	{}

	{
		invalid: 'entry'
	}

	{
		format: 'hms'
	}

	{
		format: 'ms'
	}

	{
		format: 'm'
	}

	{
		format: 'hhh mmm sss'
	}

	{
		format: '0hhh 2mmm 2sss'
	}

	{
		speed: '250 words per minute'
	}

	{
		hour: ['h', 'hr', ' hour']
	}

	{
		hours: ['h', 'hrs', ' hours']
	}

	{
		minute: ['m', 'min', ' minute'],
		minutes: ['foo', 'bar', 'baz']
	}

	{
		second: ['s', 'sec', ' second'],
		seconds: ['s', 'secs', ' seconds']
	}

*/