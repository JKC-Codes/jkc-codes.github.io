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
			if(regExSpeed.test(option)) {
				options.speed = option;
			}
			else {
				options.format = option;
			}
		})
	}

	// Validate options
	function validateAffixes(optionKey, affix) {
		if(typeof affix === 'string') {
			affix = [affix];
			return;
		}
		else if(
			Array.isArray(affix) && affix.every(entry => typeof entry === 'string')) {
			return;
		}
		else {
			throw new Error(`Time-to-read's ${optionKey} option must be a string or array of strings`);
		}
	}

	function validateFormat(options) {
		const format = options.format;
		const isString = typeof format === 'string';
		// Regex = 1 or more of: 0 or more numbers + 'h', 'm' or 's' + optional 1 or more spaces
		const isOnlyTime = /^([0-9]*[hms] *)+$/i.test(format);
		// Regex = '{' + 1 or more 'h', 'm' or 's' + '}'
		const hasExpression = /{(h+|m+|s+)}+/i.test(format);

		if(!(isString && (isOnlyTime || hasExpression))) {
			throw new Error(`Time-to-read's format option must be a string containing only h, m or s each optionally preceeded by numbers, or any string with them enclosed by {}. Received '${format}'`);
		}
	}

	function validateSpeed(options) {
		const speed = options.speed;
		if(!regExSpeed.test(speed)) {
			throw new Error(`Time-to-read's speed option must be a string matching: '(Number) ${regExMeasure} (optional 'per' or 'a' or 'an') ${regExInterval}'. Received '${speed}'`);
		}
	}

	// Add required keys to options object
	function addKeysFormat(format) {
		/*
			hours index
			minutes index
			seconds index
			hours padding
			minutes padding
			seconds padding
			custom text
		*/

		if(/{(h+|m+|s+)}+/i.test(format)) {
			// has expressions
		}

		delete options.format;
	}

	function addKeysSpeed(options) {
		const speedArray = options.speed.split(' ');
		options.quantity = Number(speedArray[0]);
		options.measure = speedArray[1];
		options.interval = speedArray[speedArray.length - 1];
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
				validateFormat(options);
				addKeysFormat(options);
			break;

			case 'speed':
				validateSpeed(options);
				addKeysSpeed(options);
			break;

			default: throw new Error(`Time-to-read encountered an unrecognised option: ${option}`);
		}
	}

	return options;

}