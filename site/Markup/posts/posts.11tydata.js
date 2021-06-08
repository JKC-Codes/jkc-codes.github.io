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
				return (isDraft && !isDevEnvironment) ? false : (data.permalink || '/blog/{{ page.fileSlug | slug }}/');
			}
		}
	}
}