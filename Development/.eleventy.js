module.exports = function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("./img/");
	eleventyConfig.addPassthroughCopy("./js/");
	eleventyConfig.addPassthroughCopy({"./js/serviceworker.js":"./serviceworker.js"});
	eleventyConfig.addPassthroughCopy({"./.netlify/_redirects":"./_redirects"});
  return {
    dir: {
			input: "html/",
			output: "staging/",
			includes: "_templates/"
		},
		passthroughFileCopy: true
  };
};