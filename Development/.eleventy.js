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

function createExtractORIGINAL(text, wordLimit = 50) {
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
}

function createExtract(text, wordLimit = 50) {
	// Start from first paragraph
	// Regex = '<p' + optional space followed by 0 or more characters that are not '>' + '>'
	const firstParagraph = text.search(/<p(\s[^>]*)?>/, 'i');
	let article = text.slice(firstParagraph);

	function segment(string) {
		// Regex = '<' + optional '/' + any number of letters + optional any number of space followed by 0 or more characters that are not '>' + '>'
		let regex = /<\/?([a-z]+)(\s[^>]*)?>/i;
		let tag = string.match(regex);
		let tagElement = tag[1];
		let tagIndex = tag.index;
		let tagType = tag[0][1] === '/' ? 'closing' : 'opening';
		let nextTagIndex = string.slice(1).match(regex).index + 1;
		let tagContent = string.slice(0, nextTagIndex);
		let tagText = tagContent.slice(tagContent.indexOf('>') + 1);

		return {
			content: tagContent,
			text: tagText,
			index: tagIndex,
			element: tagElement,
			type: tagType
		}
	}

	let test = segment(article).content;
	return test;

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