module.exports = () => {
	return {
		layout: 'post',
		eleventyComputed: {
			title: data => data.title || data.page.fileSlug,
			published: data => {
				const storedDate = data.postDates[data.page.url]?.published;
				return data.date || storedDate || data.page.date;
			},
			modified: data => {
				const storedDate = data.postDates[data.page.url]?.modified;
				return data.date || storedDate || data.page.date;
			},
			eleventyExcludeFromCollections: data => {
				const isDraft = 'draft' in data && data.draft !== false;
				return (isDraft && !data.isDevEnvironment) ? true : data.eleventyExcludeFromCollections;
			},
			permalink: data => {
				const isDraft = 'draft' in data && data.draft !== false;

				if(isDraft && !data.isDevEnvironment) {
					return false;
				}
				else if(data.permalink === '') {
					return '/blog/{{ page.fileSlug | slugify }}/';
				}
				else {
					return data.permalink;
				}
			}
		}
	}
}