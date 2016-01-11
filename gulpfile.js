'use strict';

const gulp = require('gulp');

const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const rollup = require('gulp-rollup');
const sourcemaps = require('gulp-sourcemaps');

const babel = require('rollup-plugin-babel');

gulp.task('bundleJS', () => {
  gulp.src('src/rouge.js', { read: false })
      .pipe(plumber())
      .pipe(rollup({
        format: 'umd',
        sourceMaps: process.env.NODE_ENV === 'production' ? true : false,
        plugins: babel(),
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest('dist'));
});

gulp.task('default', ['bundleJS']);
