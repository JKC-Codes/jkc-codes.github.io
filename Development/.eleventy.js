module.exports = function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("css/");
	eleventyConfig.addPassthroughCopy("img/");
	eleventyConfig.addPassthroughCopy("js/");
	eleventyConfig.addPassthroughCopy({"js/serviceworker.js":"/serviceworker.js"});
  return {
    dir: {
			input: "html/",
			output: "staging/",
			includes: "_templates/"
		},
		passthroughFileCopy: true
  };
};