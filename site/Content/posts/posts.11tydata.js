module.exports = () => {
	return {
		layout: "post",
		permalink: "/blog/{{ page.fileSlug | slug }}/",
		eleventyComputed: {
			title: data => data.title ? data.title : data.page.fileSlug
		}
	}
}