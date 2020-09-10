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

function parseSpeedOption(speedOption) {
	const speedOptions = speedOption.split(' ');
	return {
		amount: Number(speedOptions[0]),
		measure: speedOptions[1].toLowerCase(),
		interval: speedOptions[speedOptions.length - 1].toLowerCase()
	};
}

function parseLabel(label) {
	const display = new RegExp(`${regEx.labels}`,'i').exec(label);
	return {
		display: label === false ? false : display[0].toLowerCase(),
		auto: new RegExp(/auto/,'i').test(label)
	};
}

function calculateSeconds(text, { amount, measure, interval } = speedUnit) {
	let subject;
	if(measure === 'words') {
		// Split words by whitespace and remove any empty values
		subject = text.split(/\s/).filter(word => word);
	}
	else if(measure === 'characters') {
		// Remove all whitespace and normalise non-latin characters
		subject = text.replace(/\s/g, '').normalize('NFC');
	}
	let count = subject.length / amount;

	// Normalise to seconds
	switch(interval) {
		case('hour'): count *= 60;
		case('minute'): count *= 60;
	}

	return Math.ceil(count);
}

function createNumberFormat(language, unit, display, digits) {
	return new Intl.NumberFormat(language,  {
    style: 'unit',
    unit: unit,
		unitDisplay: display,
		minimumIntegerDigits: digits
	});
}

function constructTimeToRead(labels, seconds) {
	if(labels.hours.display) {
		// foo
	}

	if(labels.minutes.display) {
		//bar
	}

	if(labels.minutes.display) {
		//baz
	}



	// Add labels according to language and label option
	// Add minimum digits using minimumIntegerDigits
	// uses options' language, label, digits
	return `${Math.ceil(seconds/60)} minutes`;
}

module.exports = function(content, options) {
	const text = convertToPlainText(content);
	const speedUnits = parseSpeedOption(options.speed);
	const labels = {
		hours: parseLabel(options.hours),
		minutes: parseLabel(options.minutes),
		seconds: parseLabel(options.seconds)
	};
	const seconds = calculateSeconds(text, speedUnits);
	const timeToRead = constructTimeToRead(labels, seconds);

	// {seconds: 'only'} option
	if(options.seconds !== false && options.seconds.toLowerCase() === 'only') {
		return seconds;
	}

	let sentence = timeToRead;
	if(options.prepend) {
		sentence = options.prepend + sentence;
	}
	if(options.append) {
		sentence = sentence + options.append;
	}

	console.log(sentence);
	return sentence;
}



/*
console.log(new Intl.NumberFormat("en-GB",  {
    style: 'unit',
    unit: "second",
  	unitDisplay: "narrow",
		minimumIntegerDigits: 2
}).format(50));

console.log(new Intl.NumberFormat("en-GB",  {
    style: 'unit',
    unit: "second",
  	unitDisplay: "short",
		minimumIntegerDigits: 2
}).format(50));

console.log(new Intl.NumberFormat("en-GB",  {
    style: 'unit',
    unit: "second",
  	unitDisplay: "long",
		minimumIntegerDigits: 2
}).format(50));
*/