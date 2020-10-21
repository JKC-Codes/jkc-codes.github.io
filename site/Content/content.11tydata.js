module.exports = {
	layout: "default",
	eleventyComputed: {
		permalink: data => {
			if(data.permalink) {
				return data.permalink;
			}
			else {
				return data.page.filePathStem.replace(/^\/pages/, '') + '/index.html';
			}
		}
	}
};