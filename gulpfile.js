'use strict';

const gulp = require('gulp');
const path = require('path');
const runSequence = require('run-sequence');

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const foreach = require('gulp-foreach');
const plumber = require('gulp-plumber');
const rollup = require('gulp-rollup');
const sourcemaps = require('gulp-sourcemaps');

const rollupPlugins = {
  babel: require('rollup-plugin-babel'),
  uglify: require('rollup-plugin-uglify'),
};

const JS_PATHS = {
  dest: 'dist',
  entryPoint: path.join('lib', 'rouge.js'),
  srcGlob: path.join('lib', '*.js'),
};

function stripFlowTypes(s) {
  return s.pipe(plumber())
          .pipe(sourcemaps.init())
          .pipe(babel({
            babelrc: false,
            comments: process.env.NODE_ENV === 'development' ? true : false,
            compact: process.env.NODE_ENV === 'development' ? true : false,
            plugins: ['transform-flow-strip-types'],
            sourceMaps: true,
          }))
          .pipe(sourcemaps.write('.'))
          .pipe(plumber.stop())
          .pipe(gulp.dest(path.join(JS_PATHS.dest, 'es6')));
}

gulp.task('bundleJS_es5', () => {
  let plugins = [rollupPlugins.babel()];

  if (process.env.NODE_ENV === 'production') {
    plugins.push(rollupPlugins.uglify());
  }

  gulp.src(JS_PATHS.entryPoint, { read: false })
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(rollup({
        format: 'cjs',
        sourceMap: true,
        plugins: plugins,
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(plumber.stop())
      .pipe(gulp.dest(path.join(JS_PATHS.dest, 'es5')));
});

gulp.task('bundleJS_es6', () => {
  gulp.src(JS_PATHS.srcGlob).pipe(foreach(stripFlowTypes));
});

gulp.task('watch', () => {
  gulp.watch(JS_PATHS.srcGlob, ['bundleJS_es5', 'bundleJS_es6']);
});

gulp.task('default', () => {
  runSequence(['bundleJS_es5', 'bundleJS_es6'], 'watch');
});
