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

function getUnitsOfTime(totalSeconds, labels) {
	let hours;
	let minutes;
	let seconds;
	let remainingSeconds = totalSeconds;

	// Calculate hours
	if(labels.hours.display) {
		if(labels.minutes.display || labels.seconds.display) {
			hours = Math.floor(remainingSeconds / 3600);
		}
		else {
			hours = Math.round(remainingSeconds / 3600);
			if(hours === 0) {
				hours = 1;
			}
		}
		remainingSeconds = remainingSeconds % 3600;
	}

	// Calculate minutes
	if(labels.minutes.display) {
		if(labels.seconds.display) {
			minutes = Math.floor(remainingSeconds / 60);
		}
		else {
			minutes = Math.round(remainingSeconds / 60);
			if(labels.hours.display && minutes === 60) {
				minutes = 59;
			}
			else if(!labels.hours.display && minutes === 0) {
				minutes = 1;
			}
		}
		remainingSeconds = remainingSeconds % 60;
	}

	// Calculate seconds
	seconds = remainingSeconds;

	return {
		hours,
		minutes,
		seconds
	}
}

function createNumberFormat(language, unit, display, digits) {
	return new Intl.NumberFormat(language,  {
    style: 'unit',
    unit: unit,
		unitDisplay: display,
		minimumIntegerDigits: digits
	});
}

function constructTimeToRead(timeUnits, labels, language, digits) {
	let times =[]; // Need to be sure of object order
	for(timeUnit in timeUnits) {
		const isAutoAndZero = labels[timeUnit].auto && timeUnits[timeUnit] === 0;
		if(labels[timeUnit].display && !isAutoAndZero) {
			const unit = new RegExp(regEx.speedUnitInterval,'i').exec(timeUnit)[0].toLowerCase();
			const style = createNumberFormat(language, unit, labels[timeUnit].display, digits);
			times.push(style.format(timeUnits[timeUnit]));
		}
	}

	return times[0];
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
	const timeUnits = getUnitsOfTime(seconds, labels);
	const timeToRead = constructTimeToRead(timeUnits, labels, options.language, options.digits);

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

	// console.log(sentence);
	return sentence;
}