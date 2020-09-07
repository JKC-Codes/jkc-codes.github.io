const regEx = require('./regular-expressions.js');

module.exports = function(input, optionsArgument) {
	const options = optionsArgument;

	// Accept template object or a string
	const html = input.templateContent || input;

	// Validate input
	if(typeof html !== 'string') {
		throw new Error("Time-to-read's input must be a string");
	}

	// Make options easily accessible
	const speedArray = options.speed.split(' ');
	options.speedQuantity = Number(speedArray[0]);
	options.speedMeasure = speedArray[1];
	options.speedInterval = speedArray[speedArray.length - 1];
	delete options.speed;

	// Remove html and spaces
	const text = html.replace(`/${regEx.html}|\s/gi`, '');

	// The number of characters read per minute tends to be around 1000 for all languages: https://en.wikipedia.org/wiki/Words_per_minute#Reading_and_comprehension
	const minutes = Math.ceil(text.length / 1000);
	return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;

}