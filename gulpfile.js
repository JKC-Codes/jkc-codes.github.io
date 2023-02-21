const
	destination = './docs/',
	gulp = require('gulp'),
	minifyHTML = require('gulp-html-minimizer'),
	minifyJS = require('gulp-terser'),
	minifyIMG = require('gulp-imagemin'),
	shell = require('child_process').exec
;


function reset() {
	return shell(`npx del-cli ${destination}`);
}

function redirect() {
	return gulp.src('./.netlify/_redirects')
		.pipe(gulp.dest(destination));
}

function eleventy() {
	return shell(`npx @11ty/eleventy --output="${destination}"`);
}

function css() {
	return shell(`npx sass site/Styles:${destination}css --style=compressed --no-source-map`);
}

function html() {
	return gulp.src(destination + '**/*.html')
	.pipe(minifyHTML({
		collapseBooleanAttributes: true,
		collapseInlineTagWhitespace: true,
		collapseWhitespace: true,
		conservativeCollapse: true,
		minifyCSS: true,
		minifyJS: true,
		preserveLineBreaks: true,
		removeComments: true,
		removeEmptyAttributes: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true
	}))
	.pipe(gulp.dest(destination));
}

function js() {
	return Promise.all([
		gulp.src(['./site/Scripts/**/*.js', '!./site/Scripts/**/serviceworker.js'])
			.pipe(minifyJS())
			.pipe(gulp.dest(destination + 'js/')),

		gulp.src(['./site/Scripts/**/serviceworker.js'])
			.pipe(minifyJS())
			.pipe(gulp.dest(destination))
	]);
}

function img() {
	return gulp.src(destination + 'img/**')
	.pipe(minifyIMG([
		minifyIMG.gifsicle(),
		minifyIMG.mozjpeg(),
		minifyIMG.optipng(),
		minifyIMG.svgo({plugins: [{removeViewBox: false}]})
	]))
	.pipe(gulp.dest(destination + 'img/'));
}

function netlify() {
	return shell(`netlify deploy --dir=${destination} --prod`);
}

function browser() {
	return shell('start firefox.exe -private-window https://jkc-codes.netlify.app');
}


exports.default = gulp.series(
	reset,
	gulp.parallel(
		redirect,
		css,
		gulp.series(
			eleventy,
			gulp.parallel(
				html,
				js,
				img
			),
		),
	),
	netlify,
	gulp.parallel(
		browser,
		reset
	)
);

exports.publish = gulp.series(
	reset,
	gulp.parallel(
		css,
		gulp.series(
			eleventy,
			gulp.parallel(
				html,
				js,
				img
			),
		),
	),
);