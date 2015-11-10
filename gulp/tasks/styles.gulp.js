/**
 * STYLES TASKS
 */
'use strict';

var gulp = require('gulp');
var config = require('../gulp.config')();
var $ = require('gulp-load-plugins')({ lazy: true });
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var errorLogger = require('../utils/errorLogger.gulp');
var messageLogger = require('../utils/messageLogger.gulp')();

gulp.task('scss:build', ['clean:css'], function () {
  messageLogger('Compiling SCSS --> CSS');
  return gulp
    .src('app/styles/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass({
      outputStyle: 'compact',
      includePaths: config.vendorFiles.scss.paths
    }))
    .on('error', errorLogger)
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', '> 5%']
    }))
    .pipe($.rename({
      dirname: 'styles/',
      basename: config.cssName,
      extname: '.css'
    }))
    .pipe($.if(args.verbose, $.print()))
    .pipe($.sourcemaps.write('/'))
    .pipe(gulp.dest(config.build))
    .pipe(browserSync.stream({
      match: '**/*.css'
    }));
});

gulp.task('watch:scss', function () {
  if (!args.dist) {
    gulp.watch([
      config.app + '/**/*.scss',
      config.vendorFiles.scss.files
    ], [
        'scss:build'
      ]);
  }
})
