'use strict';

const gulp = require('gulp');

const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const rollup = require('gulp-rollup');
const sourcemaps = require('gulp-sourcemaps');

const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');

gulp.task('bundleJS', () => {
  gulp.src('lib/rouge.js')
      .pipe(plumber())
      .pipe(rollup({
        format: 'cjs',
        sourceMap: process.env.NODE_ENV === 'production' ? true : false,
        plugins: [
          babel(),
          uglify(),
        ],
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest('dist'));
});

gulp.task('default', ['bundleJS']);
