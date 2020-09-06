module.exports = function(customOptions) {

	let options = customOptions;
	const regExQuantity = String.raw`[0-9]+`; // Regex = 1 or more numbers
	const regExMeasure = String.raw`(characters|words)`;
	const regExInterval = String.raw`(hour|minute|second)`;
	// Regex = quantity + space + measure + space + optional 'per ' or 'a ' + interval
	const regExSpeed = new RegExp(`^${regExQuantity} ${regExMeasure} ((per|a|an) )?${regExInterval}$`, 'i');

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

	function validateFormat(value) {
		const isString = typeof value === 'string';
		// Regex = 1 or more of: 0 or more numbers + 'h', 'm' or 's' + optional 1 or more spaces
		const isOnlyTime = value.match(/^([0-9]*[hms] *)+$/i);
		// Regex = '{' + 1 or more 'h', 'm' or 's' + '}'
		const hasExpression = value.match(/{(h+|m+|s+)}+/i);

		if(!(isString && (isOnlyTime || hasExpression))) {
			throw new Error(`Time-to-read's format option must be a string containing only h, m or s preceeded by numbers, or any string with them enclosed by {}. Received '${value}'`);
		}
	}

	function validateSpeed(value) {
		if(!value.match(regExSpeed)) {
			throw new Error(`Time-to-read's speed option must be a string matching: '(Number) ${regExMeasure} (optional 'per' or 'a' or 'an') ${regExInterval}'. Received '${value}'`);
		}
	}

	function addFormatKeys() {

	}

	function addSpeedKeys(entryString) {
		const optionsArray = entryString.split(' ');
		options.quantity = Number(optionsArray[0]);
		options.measure = optionsArray[1];
		options.interval = optionsArray[optionsArray.length - 1];
		delete options.speed;
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
				validateFormat(options[option]);
				addFormatKeys();
			break;

			case 'speed':
				validateSpeed(options[option]);
				addSpeedKeys(options[option]);
			break;

			default: throw new Error(`Time-to-read encountered an unrecognised option: ${option}`);
		}
	}

	return options;

}