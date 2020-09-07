// Regex = '{' + 0 or more numbers + 1 or more of either 'h', 'm' or 's' + '}'
const formatVariable = String.raw`{([0-9]*)(h+|m+|s+)}`;

// Regex = 1 or more numbers
const speedQuantity = String.raw`[0-9]+`;

// Regex = 'characters' or 'words'
const speedMeasure = String.raw`(characters|words)`;

// Regex = 'hour' or 'minute' or 'second'
const speedInterval = String.raw`(hour|minute|second)`;

// Regex = quantity + space + measure + space + optional 'per ' or 'a ' or 'an ' + interval
const speed = String.raw`^${speedQuantity} ${speedMeasure} ((per|a|an) )?${speedInterval}$`;

// Regex = '<' + optional '/' + 1 or more alphanumeric characters + a non-word character + 0 or more non-'>' characters + '>'
const htmlTags = String.raw`<\/?[a-z0-9]+\b[^>]*>`;

//Regex = '<!--' + the minimal amount of 0 or more characters + '-->'
const htmlComments = String.raw`<!--[^]*?-->`;

// Regex = htmlTags or htmlComments
const html = String.raw`${htmlTags}|${htmlComments}`;

module.exports = {
	formatVariable: formatVariable,
	speedQuantity: speedQuantity,
	speedMeasure: speedMeasure,
	speedInterval: speedInterval,
	speed: speed,
	htmlTags: htmlTags,
	htmlComments: htmlComments,
	html: html
}