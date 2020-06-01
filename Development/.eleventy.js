module.exports = function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("./img/");
	eleventyConfig.addPassthroughCopy("./js/");
	eleventyConfig.addPassthroughCopy({"./js/serviceworker.js":"./serviceworker.js"});
	eleventyConfig.addPassthroughCopy({"./.netlify/_redirects":"./_redirects"});
	eleventyConfig.setBrowserSyncConfig({
    files: "./staging/css/**/*"
  });
  return {
    dir: {
			input: "html/",
			output: "staging/",
			includes: "_templates/"
		},
		passthroughFileCopy: true
  };
};