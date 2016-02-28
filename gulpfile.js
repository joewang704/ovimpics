'use strict'

const gulp = require('gulp');
const server = require('gulp-express');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

gulp.task('browserify', () => {
  return browserify({
    entries: './src/js/app.js',
    debug: true,
  }).transform(babelify, {presets: "es2015"})
    .bundle()
    .pipe(source('./bundle.js'))
    .pipe(gulp.dest('./src'));
});

gulp.task('default', ['browserify'], () => {
  server.run(['index.js']);
  gulp.watch('./src/js/**/*', ['browserify']);
  gulp.watch('./index.js', server.run);
});
