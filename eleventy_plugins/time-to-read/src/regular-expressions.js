module.exports = {
	// Regex = '{' + 0 or more numbers + 1 or more of either 'h', 'm' or 's' + '}'
	formatVariable: String.raw`{([0-9]*)(h+|m+|s+)}`,

	// Regex = 1 or more numbers
	speedQuantity: String.raw`[0-9]+`,

	// Regex = 'characters' or 'words'
	speedMeasure: String.raw`(characters|words)`,

	// Regex = 'hour' or 'minute' or 'second'
	speedInterval: String.raw`(hour|minute|second)`,

	// Regex = quantity + space + measure + space + optional 'per ' or 'a ' or 'an ' + interval
	speed: String.raw`^${this.speedQuantity} ${this.speedMeasure} ((per|a|an) )?${this.speedInterval}$`,

	// Regex = '<' + optional '/' + 1 or more alphanumeric characters + a non-word character + 0 or more non-'>' characters + '>'
	htmlTags: String.raw`<\/?[a-z0-9]+\b[^>]*>`,

	//Regex = '<!--' + the minimal amount of 0 or more characters + '-->'
	htmlComments: String.raw`<!--[^]*?-->`,

	// Regex = space character
	htmlSpaces: String.raw`\s`,
}