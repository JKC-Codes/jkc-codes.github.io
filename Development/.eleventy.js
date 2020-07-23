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
		// Pass in templateContent so only content will be passed in
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

function getSummary(text, wordLimit = 50) {
	// Look for '<p ' + some type of attribute may go here + '>'
	const firstParagraph = text.search(/<p\b.*>/);
	// Get the first X number of words starting from the first paragraph
	const extract = text.slice(firstParagraph).split(' ', wordLimit).join(' ');
	// Add an ellipsis to the last word
	const summary = extract + '&hellip;';



	return summary;


	// TODO strip out images and videos, reduce headings by one level
}