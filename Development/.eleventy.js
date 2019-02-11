module.exports = function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("css/");
	eleventyConfig.addPassthroughCopy("img/");
	eleventyConfig.addPassthroughCopy("js/");
	eleventyConfig.addPassthroughCopy("serviceworker.js");
  return {
    dir: {
			input: "html/",
			output: "staging",
			includes: "_templates/"
		},
		passthroughFileCopy: true
  };
};