const regEx = require('./regular-expressions.js');

function validateSpeed(speed) {
	if(typeof speed !== 'string') {
		throw new Error(`Time-to-read's speed option must be a string. Received ${language}`);
	}
	else if(!new RegExp(regEx.speed,'i').test(speed)) {
		throw new Error(`Time-to-read's speed option must be a string matching: '(Number) ${regEx.speedUnitMeasure} optional ${regEx.speedUnitPreposition} ${regEx.speedUnitInterval}'. Received '${speed}'`);
	}
}

function validateLanguage(language) {
	if(typeof language !== 'string') {
		throw new Error(`Time-to-read's language option must be a string. Received ${language}`);
	}

	try {
		Intl.getCanonicalLocales(language);
	}
	catch {
		throw new Error(`Time-to-read's language option must be a valid locale format. Received ${language}`);
	}

	if(!Intl.NumberFormat.supportedLocalesOf(language)[0]) {
		throw new Error(`The locale used in time-to-read's language option (${language}) is not supported. Received ${language}`);
	}
}

function validateLabel(label, optionKey) {
	if(label === false || (optionKey.toUpperCase() === 'SECONDS' && label.toUpperCase() === 'ONLY')) {
		return;
	}

	if(typeof label !== 'string') {
		throw new Error(`Time-to-read's ${optionKey} option must be a string or False. Received ${language}`);
	}

	const secondsText = optionKey.toUpperCase() === 'SECONDS' ? " 'only', ":" ";
	if(!new RegExp(regEx.label,'i').test(label)) {
		throw new Error(`Time-to-read's ${optionKey} option must be a string containing${secondsText}'false' or '${regEx.labels}' with optional 'auto' separated by a space. Received '${label}'`);
	}
}

function validateInserts(insert, optionKey) {
	if(typeof insert !== 'string' && insert !== null) {
		throw new Error(`Time-to-read's ${optionKey} option must be a string. Received ${insert}`);
	}
}

function validateDigits(digits) {
	const digitsAsNumber = Number(digits);
	const isInteger = Number.isInteger(digitsAsNumber);
	const isWithinRange = digitsAsNumber >= 1 && digitsAsNumber <= 21;
	if(!isInteger || !isWithinRange) {
		throw new Error(`Time-to-read's digits option must be an integer from 1 to 21. Received ${insert}`);
	}
}

module.exports = function(options) {
	for(option in options) {
		switch(option) {
			case 'speed':
				validateSpeed(options[option]);
			break;

			case 'language':
				validateLanguage(options[option]);
			break;

			case 'hours':
			case 'minutes':
			case 'seconds':
				validateLabel(options[option], option);
			break;

			case 'prepend':
			case 'append':
				validateInserts(options[option], option);
			break;

			case 'digits':
				validateDigits(options[option]);
			break;

			default: throw new Error(`Time-to-read encountered an unrecognised option: ${option}`);
		}
	}
}