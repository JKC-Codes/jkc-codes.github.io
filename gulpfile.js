const
	gulp = require('gulp'),
	destination = './staging/',
	del = require('del'),
	htmlmin = require('gulp-htmlmin'),
	sass = require('gulp-sass'),
	terser = require('gulp-terser'),
	imagemin = require('gulp-imagemin'),
	shell = require('child_process').exec
;


function reset() {
	return del(`${destination}`);
}

function eleventy() {
	return shell(`npx @11ty/eleventy --output="${destination}"`);
}

function cname() {
	return gulp.src('./CNAME')
		.pipe(gulp.dest(destination));
}

function redirect() {
	return gulp.src('./.netlify/_redirects')
		.pipe(gulp.dest(destination));
}

function html() {
	return gulp.src(destination + '**/*.html')
	.pipe(htmlmin({
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

function css() {
	return gulp.src('sass/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(gulp.dest(destination + 'css'));
}

function js() {
	return gulp.src(destination + '**/*.js')
		.pipe(terser())
		.pipe(gulp.dest(destination));
}

function sw() {
	return new Promise((resolve, reject) => {
		gulp.src(destination + 'js/serviceworker.js')
			.pipe(gulp.dest(destination))
			.on('end', ()=> {
				return del([destination + 'js/serviceworker.js'])
			})
			.on('end', resolve)
			.on('error', reject);
	})
}

function img() {
	return gulp.src(destination + 'img/**')
	.pipe(imagemin([
		imagemin.gifsicle(),
		imagemin.mozjpeg(),
		imagemin.optipng(),
		imagemin.svgo({plugins: [{removeViewBox: false}]})
	]))
	.pipe(gulp.dest(destination + 'img/'));
}

function netlify() {
	return shell(`netlify deploy --dir=${destination} --prod`);
}

function browser() {
	return shell('start firefox.exe -private-window https://jkc-codes.netlify.app');
}


exports.stage = gulp.series(
	reset,
	eleventy,
	gulp.parallel(
		cname,
		redirect,
		html,
		css,
		gulp.series(js, sw),
		img
	),
	netlify,
	browser
);

exports.publish = gulp.series(
	reset,
	eleventy,
	gulp.parallel(
		cname,
		html,
		css,
		gulp.series(js, sw),
		img
	)
);