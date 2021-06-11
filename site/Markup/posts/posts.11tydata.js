require('dotenv').config();

const isDevEnvironment = process.env.ELEVENTY_ENV === 'development';

module.exports = () => {
	return {
		layout: 'post',
		eleventyComputed: {
			title: data => data.title ? data.title : data.page.fileSlug,
			eleventyExcludeFromCollections: data => {
				const isDraft = 'draft' in data && data.draft !== false;
				return (isDraft && !isDevEnvironment) ? true : data.eleventyExcludeFromCollections;
			},
			permalink: data => {
				const isDraft = 'draft' in data && data.draft !== false;

				if(isDraft && !isDevEnvironment) {
					return false;
				}
				else if(data.permalink === '') {
					return '/blog/{{ page.fileSlug | slug }}/';
				}
				else {
					return data.permalink;
				}
			}
		}
	}
}