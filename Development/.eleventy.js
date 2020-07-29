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
	eleventyConfig.addShortcode('extract', function(article, wordLimit) {
		return createExtract((article.templateContent || article), wordLimit);
	});

	return {
		dir: {
			input: 'html/',
			output: 'staging/'
		},
		passthroughFileCopy: true
  };
};











function createExtract(text, wordLimit = 10) {
	// Start from first paragraph so any table of contents are skipped
	// Regex = '<p' + optional space followed by 0 or more characters that are not '>' + '>'
	const firstParagraph = text.search(/<p(\s[^>]*)?>/, 'i');
	const article = text.slice(firstParagraph);

	// Regex = '<' + optional '/' + 1 or more characters that aren't '<' or whitespace + optional any number of space followed by 0 or more characters that are not '>' + '>'
	const tagsRegex = RegExp(/<(\/?)(([^>\s])+)(\s[^>]*)?>/, 'gim');
	let firstTag = tagsRegex.exec(article);
	let secondTag = tagsRegex.exec(article);
	let extractWordCount = 0;
	let extract = '';

	while(extractWordCount < wordLimit && secondTag !== null) {
		let segmentHTML = article.slice(firstTag.index, secondTag.index);
		const segmentText = segmentHTML.slice(segmentHTML.indexOf('>') + 1);
		// Split text by whitespace and filter out any empty strings
		const segmentWordCount = segmentText.split(/\s/).filter(word => word).length;
		const segmentTag = firstTag[2];
		const segmentType = firstTag[1] ? 'closing' : 'opening';

		// Remove images


		// Check word count
		extractWordCount += segmentWordCount;
		if(extractWordCount > wordLimit) {
			const difference = extractWordCount - wordLimit;
			const desiredWordCount = segmentWordCount - difference;
			// Regex = 0 or more whitespace characters + 1 or more non-whitespace characters
			const newText = segmentText.match(/\s*\S+/gim);
			newText.length = desiredWordCount;
			segmentHTML = firstTag[0] + newText.join('');
		}

		// Update heading levels
		console.log(segmentTag, segmentType);

		// Update extract
		extract += segmentHTML;

		// Iterate to next segment
		firstTag = secondTag;
		secondTag = tagsRegex.exec(article);
	}

	// Close any unclosed tags


	// Add an ellipsis to the end


	return extract;
}