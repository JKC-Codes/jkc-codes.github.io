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
	eleventyConfig.addShortcode('extract', function(article, options) {
		return createExtract(article, options);
	});

	return {
		dir: {
			input: 'html/',
			output: 'staging/'
		},
		passthroughFileCopy: true
  };
};











function createExtract(text, options = {}) {

	// Set options as arguments or default values
	const {
		wordLimit = 50,
		initialHeadingLevel = 3
	} = options;

	// Use file's text content or take a string directly
	text = text.templateContent || text;

	// Check arguments are valid
	if(typeof wordLimit !== 'number' || wordLimit < 1) {
		throw new Error('wordLimit must be an integer greater than 1');
	}

	if(typeof initialHeadingLevel !== 'number' || initialHeadingLevel < 1 || initialHeadingLevel > 6) {
		throw new Error('intitialHeadingLevel must be an integer from 1 to 6');
	}

	if(typeof text !== 'string' || text.length < 1) {
		throw new Error('extract source must be a non-empty string');
	}

	// Start from first paragraph so any table of contents are skipped
	// Regex = '<p' + optional space followed by 0 or more characters that are not '>' + '>'
	const firstParagraph = text.search(/<p(\s[^>]*)?>/, 'i');
	const article = firstParagraph === -1 ? text : text.slice(firstParagraph);

	// Regex = '<' + optional '/' + 1 or more characters that aren't '>' or whitespace + optional any number of space followed by 0 or more characters that are not '>' + '>'
	const tagsRegex = RegExp(/<(\/?)([^>\s]+)(\s[^>]*)?>/, 'gim');
	let firstTag = tagsRegex.exec(article);
	let secondTag = tagsRegex.exec(article);
	let extractWordCount = 0;
	let extract = '';
	let headingLevelOffset = null;
	let unclosedTags = [];

	while(extractWordCount < wordLimit && secondTag !== null) {
		let segmentHTML = article.slice(firstTag.index, secondTag.index);
		const segmentText = segmentHTML.slice(segmentHTML.indexOf('>') + 1);
		// Split text by whitespace and filter out any empty strings
		const segmentWordCount = segmentText.split(/\s/).filter(word => word).length;
		const segmentTag = firstTag[2];
		const segmentType = firstTag[1] ? 'closing' : 'opening';

		// Remove images
		if(segmentTag === 'img') {
			// Iterate to next segment
			firstTag = secondTag;
			secondTag = tagsRegex.exec(article);
			continue;
		}

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
		// Regex = 'h' + a number from 1-6
		if(/h[1-6]/i.test(segmentTag)) {
			const headingLevel = firstTag[0].match(/[1-6]/);
			let newHeadingLevel = Number(headingLevel);

			// Create offset against max heading level
			if(headingLevelOffset === null) {
				headingLevelOffset = initialHeadingLevel - newHeadingLevel;
			}

			// Adjust heading level
			newHeadingLevel += headingLevelOffset;

			// Make sure heading level isn't invalid
			if(newHeadingLevel > 6) {
				newHeadingLevel = 6;
			}

			// Replace heading level and add to HTML segment
			const newTag = firstTag[0].replace(headingLevel, newHeadingLevel.toString(10));
			segmentHTML = newTag + segmentText;
		}

		// Note any unclosed tags
		if(segmentType === 'opening') {
			unclosedTags.push(segmentTag);
		}
		else if(segmentType === 'closing') {
			unclosedTags.pop();
		}

		// Update extract
		extract += segmentHTML;

		// Iterate to next segment
		firstTag = secondTag;
		secondTag = tagsRegex.exec(article);
	}

	//Close any unclosed tags
	unclosedTags.forEach(tag => {
		extract += `</${tag}>`;
	});

	// Remove any empty tags
	// Regex = '<' + 1 or more characters that aren't '>' or whitespace + optional any number of space followed by 0 or more characters that are not '>' + '>' + 0 or more whitespace + '</' + same opening tag + '>'
	extract = extract.replace(/<([^>\s]+)(\s[^>]*)?>\s*<\/\1>/gim, '');

	// Add an ellipsis to the end
	// Regex = last instance of 1 or more of: 0 or more whitespace characters + '</' + 1 or more of any character that isn't '>' + '>'
	extract = extract.replace(/(\s*<\/[^>]+>)+$/i, '&hellip;$&');

	return extract;
}