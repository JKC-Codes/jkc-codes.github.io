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
		// Pass in templateContent so only content will be used
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
	// Regex = '<p' + 0 or more characters that are not '>' + '>'
	const firstParagraph = text.search(/<p[^>]*>/, 'i');
	// Get the first X number of words starting from the first paragraph
	let extract = text.slice(firstParagraph).split(' ', wordLimit).join(' ');

	// Remove images
	// Regex = '<img' + 0 or more characters that are not '>' + '>'
	extract = extract.replace(/<img[^>]*>/gi, '');

	// Remove any resulting empty elements
	// Regex = '<' + any number of letters + 0 or more characters that are not '>' + '>' + any number of spaces + '</' + first set of letters + '>'
	extract = extract.replace(/<([a-z]+)[^>]*>\s*<\/\1>/gi, '');

	// Add an ellipsis to the last word
	extract = extract + '&hellip;';

	return extract;

	// TODO reduce headings by one level
}