import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import Path from 'node:path';
import FS from 'node:fs/promises';

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

	let promises = [];

	for(let path of paths) {
		promises.push(FS.rm(path, options));
	}

	return Promise.all(promises);
}

function reset() {
	return del(destination);
}

function redirect() {
	return FS.cp('./.netlify/_redirects', Path.join(destination, './_redirects'));
}

function eleventy() {
	return shell(`npx @11ty/eleventy --output="${destination}"`);
}

function html() {
	// TODO: minify HTML
}

function css() {
	return shell(`npx sass site/Styles:${destination}css --style=compressed --no-source-map`);
}

function js() {
	// TODO: minify JS
	const JS = FS.cp('./site/Scripts/', Path.join(destination, './js/'), {
		recursive: true,
		filter: (src, dest) => {return src.endsWith('serviceworker.js') ? false : true}
	});
	const serviceWorker = FS.cp('./site/Scripts/serviceworker.js', Path.join(destination, './serviceworker.js'));

	return Promise.all([JS, serviceWorker]);
}

function img() {
	// TODO: optimise images
}

function netlify() {
	return shell(`netlify deploy --dir=${destination} --prod --no-build`);
}

function browser() {
	return shell('start firefox.exe -private-window https://jkc-codes.netlify.app');
}