module.exports = () => {
	return {
		layout: "post",
		permalink: "blog/{{ page.fileSlug | slug }}/",
		eleventyComputed: {
			title: function(data) {
				if(data.title) {
					return data.title
				}
				else {
					return data.page.fileSlug;
				}
			}
		}
	}
}