/*
 * @Author: Astrianna
 * @Date:   2015-01-14 17:02:35
 * @Last Modified by:   Astrianna
 * @Last Modified time: 2015-01-14 17:06:15
 */

'use strict';

var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    to5 = require('gulp-6to5');

gulp.task('default', function() {
    return gulp.src('src/*.js')
        .pipe(sourcemaps.init())
        .pipe(to5())
        .pipe(concat('lib.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
});
