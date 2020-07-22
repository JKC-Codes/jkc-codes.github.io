module.exports = function(eleventyConfig) {
	// Move folders directly to the build directory
	eleventyConfig.addPassthroughCopy('./img/');
	eleventyConfig.addPassthroughCopy('./js/');

	// Move service worker from JS folder to the root directory
	eleventyConfig.addPassthroughCopy({'./js/serviceworker.js':'./serviceworker.js'});

	// Redirect missing pages in stage to production
	eleventyConfig.addPassthroughCopy({'./.netlify/_redirects':'./_redirects'});

	// Refresh browser when CSS updates
	eleventyConfig.setBrowserSyncConfig({
		files: ['./staging/css/**/*.css', '!./staging/css/**/*.map']
	});

	// Create summaries for blog posts
	eleventyConfig.addShortcode('summarise', function(article, wordLimit) {
		return getSummary(article.templateContent, wordLimit);
	});

	return {
		dir: {
			input: 'html/',
			output: 'staging/'
		},
		passthroughFileCopy: true
  };
};

function getSummary(text, wordLimit = 50, start = 0) {
	// Look for '<p ' + some type of attribute may go here + '>'
	const firstParagraph = text.search(/<p\b.*>/);
	const closingTag = text.indexOf('</p>', start);
	const extract = text.slice(firstParagraph, closingTag);
	const words = extract.split(' ', wordLimit);

	if(words.length < wordLimit && closingTag !== -1) {
		return getSummary(text, wordLimit, closingTag + 4);
	}
	else {
		const summary = Array.from(words);
		summary[summary.length - 1] = summary[summary.length - 1] + '&hellip;';
		return summary.join(' ');
	}
}