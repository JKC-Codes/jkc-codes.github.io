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
	eleventyConfig.addShortcode('introduce', function(article, wordLimit) {
		return createIntroduction(article.templateContent || article, wordLimit);
	});

	return {
		dir: {
			input: 'html/',
			output: 'staging/'
		},
		passthroughFileCopy: true
  };
};

function createIntroduction(text, wordLimit = 50) {
	// Get index of the first <p> tag
	// Regex = '<p' + optional space followed by 0 or more characters that are not '>' + '>'
	const firstParagraph = text.search(/<p(\s[^>]*)?>/, 'i');
	// Get the first X number of words starting from the first paragraph
	let extract = text.slice(firstParagraph).split(' ', wordLimit).join(' ');

	// Close any unclosed tags


	// Remove images
	// Regex = '<img' + optional space followed by 0 or more characters that are not '>' + '>'
	extract = extract.replace(/<img(\s[^>]*)?>/gi, '');

	// Remove any resulting empty elements
	// Regex = '<' + any number of letters + optional space followed by 0 or more characters that are not '>' + '>' + any number of spaces + '</' + first set of letters + '>'
	extract = extract.replace(/<([a-z]+)(\s[^>]*)?>\s*<\/\1>/gi, '');

	// Add an ellipsis to the end
	extract = extract + '&hellip;';

	return extract;

	// TODO reduce headings by one level
	// TODO close any unclosed tags
}