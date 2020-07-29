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
		return createExtract(article.templateContent || article, wordLimit);
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

	// Regex = '<' + optional '/' + any number of letters + optional any number of space followed by 0 or more characters that are not '>' + '>'
	const tagsRegex = RegExp(/<(\/?)([a-z]+)(\s[^>]*)?>/, 'gim');
	let firstTag = tagsRegex.exec(article);
	let secondTag = tagsRegex.exec(article);
	let extractWordCount = 0;
	let extract = '';

	while(extractWordCount < wordLimit && secondTag !== null) {
		let segmentHTML = article.slice(firstTag.index, secondTag.index);
		const segmentText = segmentHTML.slice(segmentHTML.indexOf('>') + 1);
		const segmentWordCount = segmentText.split(/\s/).filter(word => word).length;
		const segmentTag = firstTag[2];
		const segmentType = firstTag[1] ? 'closing' : 'opening';

		// Check word count
		extractWordCount += segmentWordCount;
		if(extractWordCount > wordLimit) {
			const difference = extractWordCount - wordLimit;
			const textAsArray = segmentText.split(/\s/);
			textAsArray.length -= difference;
			segmentHTML = firstTag[0] + textAsArray.join(' ');
		}

		// Remove images

		// Update heading levels

		// Update extract
		extract += segmentHTML;

		// Iterate to next segment
		firstTag = secondTag;
		secondTag = tagsRegex.exec(article);
	}
	return extract;
}


























/*
<p>something <div><b>bold</b> foo <b><i>multiple</i></b></div></p>
<div>
	<p>something contained</p>
	<aside>
		<p>something floated</p>
	</aside>
</div>


node = opening or closing tag

getSection = substring.match then new index = match length
openingTag = regex
closingTag = regex
isImage
countWords



for each node
if opening tag
	if image
		continue
	if heading
		lower heading level
	push closing tag to unclosed list
else if closing tag
	if heading
		lower heading level
	if last item of unclosed list doesn't match closing tag
		continue
	pop unclosed list
add node to html extract
add node words count to extract words count
if extract words count is less than word limit
	continue
else if word limit reached
	add ellipsis to html extract
	join unclosed tags to html extract
*/