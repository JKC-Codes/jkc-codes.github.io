const
	gulp = require('gulp'),
	baseFolder = './staging/',
	del = require('del'),
	htmlmin = require('gulp-htmlmin'),
	sass = require('gulp-sass'),
	terser = require('gulp-terser'),
	imagemin = require('gulp-imagemin'),
	shell = require('child_process').exec
;


function reset() {
	return del(baseFolder);
}

function eleventy() {
	return shell(`eleventy --output="${baseFolder}"`);
}

function html() {
	return gulp.src(baseFolder + '**/*.html')
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
	.pipe(gulp.dest(baseFolder));
}

sass.compiler = require('sass');
function css() {
	return gulp.src('sass/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(gulp.dest(baseFolder + 'css'));
}

function js() {
	return gulp.src(baseFolder + '**/*.js')
		.pipe(terser())
		.pipe(gulp.dest(baseFolder));
}

function sw() {
	return new Promise((resolve, reject) => {
		gulp.src(baseFolder + 'js/serviceworker.js')
			.pipe(gulp.dest(baseFolder))
			.on('end', ()=> {
				return del([baseFolder + 'js/serviceworker.js'])
			})
			.on('end', resolve)
			.on('error', reject);
	})
}

function img() {
	return gulp.src(baseFolder + '**/img/**')
	.pipe(imagemin([
		imagemin.gifsicle(),
		imagemin.mozjpeg(),
		imagemin.optipng(),
		imagemin.svgo({plugins: [{removeViewBox: false}]})
	]))
		.pipe(gulp.dest(baseFolder));
}

function netlify() {
	return shell(`netlify deploy --dir=${baseFolder} --prod`);
}

function browser() {
	return shell('start firefox.exe -private-window https://jkc-codes.netlify.app');
}


exports.stage = gulp.series(
	reset,
	eleventy,
	gulp.parallel(
		html,
		css,
		gulp.series(js, sw),
		img
	),
	netlify,
	browser
);