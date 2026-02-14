"use strict";

import {src, dest, watch, series, parallel} from 'gulp';

// import dartSass from 'sass';
// import gulpSass from 'gulp-sass';
// const sass = gulpSass(dartSass);

import gulpSass from 'gulp-sass';
import * as dartSass from 'sass'; // Use 'sass' or 'dart-sass'
const sass = gulpSass(dartSass);

import esbuild from 'gulp-esbuild';
import notify from 'gulp-notify';
import path from 'path';
import zip from 'gulp-zip';

// paths
const scssSrc =  {
	'watch': 'dev/scss/**/*.scss',
	'src': ['dev/scss/content.scss', 'dev/scss/popup.scss'],
	'dest': './'
};
const jsSrc =  {
	'watch': 'dev/js/**/*.js',
	'src': ['dev/js/content.js', 'dev/js/popup.js'],
	'dest': './'
};
const ffSrc = [
	'./manifest.json',
	'./content.js',
	'./content.css',
	'./popup.css',
	'./popup.html',
	'./popup.js',
	'./icons/*.png'

];

export function compileSass() {
	return(
		src(scssSrc.src)
		.pipe(sass()
			.on('error', sass.logError)
		)
		.on('error', notify.onError({
			title: 'SASS Content Error',
			message: '<%= error.message %>',
			icon: path.join('.\\', 'dev', 'icons', 'sass-error.ico')
		}))
		.pipe(dest(scssSrc.dest))
		.pipe(notify({
			title: 'SASS Compiled',
			message: 'Successfully compiled',
			icon: path.join('.\\', 'dev', 'icons', 'sass.ico'),
			sound: false,
			onLast: true
		}))
	);
}

export function compileJs() {
	return(
		src(jsSrc.src)
		.pipe(esbuild({
			'bundle': true
		}))
		.on('error', notify.onError({
			'title': 'JS compile error',
			'message': '<%= error.message %>',
			icon: path.join('.\\', 'dev', 'icons', 'js-error.ico')
		}))
		.pipe(dest(jsSrc.dest))
		.pipe(notify({
			title: 'JS Compiled',
			message: 'Successfully compiled js files',
			icon: path.join('.\\', 'dev', 'icons', 'js.ico'),
			sound: false,
			onLast: true
		}))
	);
}

export function ff() {
	return (
		src(ffSrc, { base: './', encoding: false })
		.pipe(zip('twitch-superbar.zip'))
		.pipe(dest('./'))
	);
}

export function watchFiles() {
	watch(scssSrc.watch, compileSass);
	watch(jsSrc.watch, compileJs);
}

const build = series(compileSass, compileJs, watchFiles);

export default build;