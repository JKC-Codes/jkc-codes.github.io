import {promisify} from 'node:util';
import {exec} from 'node:child_process';
import Path from 'node:path';
import FS from 'node:fs/promises';

import minifyHTML from 'htmlnano';
import {minify as minifyJS} from 'terser';
import minifyIMG from 'sharp';
import { optimize as minifySVG } from 'svgo';

minifyIMG.cache(false);

const shell = promisify(exec);
const args = process.argv.slice(2);
const destination = './docs/';

init(args);

function init(args) {
	const commands = {
		'preEleventy': preEleventy,
		'preSASS': preSASS,
		'build': compile,
		'stage': compile,
	};

	return commands[args[0]](...args);
}

async function preEleventy() {
	return del(Path.join(destination, './**'), {exclude: [Path.join(destination, './css/')]});
}

async function preSASS() {
	return del(Path.join(destination, './css/**'));
}

async function compile(type) {
	await reset();
	await Promise.all([
		(() => {
			if(type === 'stage') {
				return redirect();
			}
		})(),
		css(),
		(async () => {
			await eleventy();
			return Promise.all([
				html(),
				js(),
				img()
			]);
		})()
	]);

	if(type === 'stage') {
		await netlify();
		return Promise.all([
			browser(),
			reset()
		]);
	}
	else {
		return;
	}
}

async function del(pathGlob, options) {
	console.log(`Deleting ${pathGlob}`);

	const CWD = Path.resolve();

	pathGlob = Path.resolve(pathGlob);

	if(!pathGlob.startsWith(CWD)) {
		throw new Error('Cannot delete a file outside of the working directory');
	}

	options = {
		force: true,
		recursive: true,
		...options
	}

	let paths = await Array.fromAsync(FS.glob(pathGlob, options))
		.then(paths => paths.sort((a, b) => {return b.localeCompare(a)}));

	if(pathGlob.endsWith('*')) {
		paths = paths.filter(path => {return path !== Path.join(pathGlob, '..')});
	}

	const promises = [];

	for(let path of paths) {
		promises.push(FS.rm(path, options));
	}

	return Promise.all(promises)
		.then(() => console.log(`Finished deleting ${pathGlob}`));
}

function reset() {
	return del(destination);
}

function redirect() {
	console.log('Copying Netlify redirects');

	return FS.cp('./.netlify/_redirects', Path.join(destination, './_redirects'))
		.then(() => console.log('Finished copying Netlify redirects'));
}

function eleventy() {
	console.log('Running Eleventy');

	return shell(`npx @11ty/eleventy --output="${destination}"`)
		.then(() => console.log('Finished running Eleventy'));
}

async function html() {
	console.log('Minifying HTML');

	const promises = [];
	const files = await Array.fromAsync(FS.glob('**/*.html', {cwd: destination}));
	const options = {
		collapseAttributeWhitespace: true,
		collapseWhitespace: 'conservative',
		deduplicateAttributeValues: true,
		removeComments: 'safe',
		removeEmptyAttributes: true,
		removeAttributeQuotes: false,
		removeUnusedCss: false,
		minifyCss: false,
		minifyJs: true,
		minifyJson: true,
		minifySvg: {
			plugins: [
				{
					name: 'preset-default',
					params: {
						overrides: {
							removeHiddenElems: false,
							sortAttrs: false,
							sortDefsChildren: false
						}
					}
				}
			]
		},
		minifyConditionalComments: false,
		removeRedundantAttributes: false,
		collapseBooleanAttributes: true,
		mergeStyles: false,
		mergeScripts: false,
		sortAttributesWithLists: false,
		sortAttributes: false,
		minifyUrls: false,
		removeOptionalTags: false,
		normalizeAttributeValues: false
	};

	for(const file of files) {
		const filePath = Path.join(destination, file);
		const raw = await FS.readFile(filePath, {encoding: 'utf8'});
		const minified = await minifyHTML.process(raw, options).then(result => result.html);
		promises.push(FS.writeFile(filePath, minified));
	}

	return Promise.all(promises)
		.then(() => console.log('Finished minifying HTML'));
}

function css() {
	console.log('Minifying CSS');

	return shell(`npx sass ./site/Styles:${Path.join(destination, './css/')} --style=compressed --no-source-map`)
		.then(() => console.log('Finished minifying CSS'));
}

async function js() {
	console.log('Minifying JS');

	const promises = [];
	const JSFolder = Path.join(destination, './js/');
	const files = await Array.fromAsync(FS.glob('**/*.js', {cwd: JSFolder}));

	for(const file of files) {
		minify(file, JSFolder);
	}

	minify('serviceworker.js', destination);

	return Promise.all(promises)
		.then(() => console.log('Finished minifying JS'));

	async function minify(file, folderPath) {
		const filePath = Path.join(folderPath, file);
		const raw = await FS.readFile(filePath, {encoding: 'utf8'});
		const minified = await minifyJS(raw);
		promises.push(FS.writeFile(filePath, minified.code));
	}
}

async function img() {
	console.log('Minifying images');

	const promises = [];
	const imgFolder = Path.join(destination, './img/');
	const files = await Array.fromAsync(FS.glob('**/*.{jpg,jpeg,png,webp,avif,gif,svg}', {cwd: imgFolder}));

	for(const file of files) {
		const path = Path.join(imgFolder, file);
		const image = await new minifyIMG(path);
		const meta = await image.metadata();

		if(meta.format === 'svg') {
			const SVG = await FS.readFile(path);
			promises.push(FS.writeFile(path, minifySVG(SVG).data));
		}
		else {
			const buffer = await image.toBuffer();
			promises.push(minifyIMG(buffer).toFile(path));
		}
	}

	return Promise.all(promises)
		.then(() => console.log('Finished minifying images'));
}

function netlify() {
	console.log('Deploying to Netlify');

	return shell(`netlify deploy --dir=${destination} --prod --no-build`)
		.then(() => console.log('Finished deploying to Netlify'));
}

function browser() {
	console.log('Opening browser');

	return shell('start firefox.exe -private-window https://jkc-codes.netlify.app')
		.then(() => console.log('Finished opening browser'));
}