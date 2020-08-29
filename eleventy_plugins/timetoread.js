module.exports = function(eleventyConfig) {

	eleventyConfig.addShortcode('time-to-read', function(text) {

		// TODO: remove HTML
		let minutes = Math.ceil(text.length / 1000);
		return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;

	});

}