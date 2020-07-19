module.exports = function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("./img/");
	eleventyConfig.addPassthroughCopy("./js/");
	eleventyConfig.addPassthroughCopy({"./js/serviceworker.js":"./serviceworker.js"});
	eleventyConfig.addPassthroughCopy({"./.netlify/_redirects":"./_redirects"});
	eleventyConfig.setBrowserSyncConfig({
    files: ["./staging/css/**/*.css", "!./staging/css/**/*.map"]
  });
  return {
    dir: {
			input: "html/",
			output: "staging/",
			includes: "_includes",
			layouts: "_layouts"
		},
		passthroughFileCopy: true
  };
};