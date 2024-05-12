export default {
	eleventyComputed: {
		permalink: data => {
			if(data.permalink === '') {
				return data.page.filePathStem.replace(/^\/pages/, '') + '/';
			}
			else {
				return data.permalink;
			}
		}
	}
};