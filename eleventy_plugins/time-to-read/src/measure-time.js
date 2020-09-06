module.exports = function(input, options) {

	// Accept template object or a string
	let html = input.templateContent || input;

	// Validate input
	if(typeof html !== 'string') {
		throw new Error("Time-to-read's input must be a string");
	}

	// Regex = '<' + optional '/' + 1 or more alphanumeric characters + a non-word character + 0 or more non-'>' characters + '>'
	let tags = String.raw`<\/?[a-z0-9]+\b[^>]*>`;
	//Regex = '<!--' + the minimal amount of 0 or more characters + '-->'
	let comments = String.raw`<!--[^]*?-->`;
	// Regex = space character
	let spaces = String.raw`\s`;
	// Regex = a tag, comment or space
	let regEx = new RegExp(`${tags}|${comments}|${spaces}`, 'gi');

	// Remove html and spaces
	let text = html.replace(regEx, '');

	// The number of characters read per minute tends to be around 1000 for all languages: https://en.wikipedia.org/wiki/Words_per_minute#Reading_and_comprehension
	let minutes = Math.ceil(text.length / 1000);

	return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;

}