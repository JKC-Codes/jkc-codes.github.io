const regEx = require('./regular-expressions.js');

function convertToPlainText(content) {
	// Convert template object to a string
	const html = content.templateContent || content;

	// Validate input
	if(typeof html !== 'string') {
		throw new Error("Time-to-read's input must be a string or template");
	}

	// Remove html
	return html.replace(new RegExp(regEx.html,'gi'), '');
}

function calculateTime(measurement, text, speed) {
	let amount;
	if(measurement === 'words') {
		// Split words by whitespace and remove any empty values
		amount = text.split(/\s/).filter(word => word);
	}
	else if(measurement === 'characters') {
		// Remove all whitespace and normalise non-latin characters
		amount = text.replace(/\s/g, '').normalize('NFC');
	}
	return Math.ceil(amount.length / speed);
}

module.exports = function(content, options) {
	const text = convertToPlainText(content);
	const speedOptions = options.speed.split(' ');
	const speedQuantity = Number(speedOptions[0]);
	const speedMeasure = speedOptions[1];
	const speedInterval = speedOptions[speedOptions.length - 1];
	const time = calculateTime(speedMeasure, text, speedQuantity);

	/*TODO
		modify speed according to options:
			upper/lower case = go over 60
			m/mm/mmm/mmmm = narrow, short, long, custom
			starts with 0 = only display if not 0
			1+ = always display
			2+ = always display with padding
		add hour,minute,second(s)
		replace variables with above
	*/

	return `${time} ${time === 1 ? 'minute' : 'minutes'}`
}