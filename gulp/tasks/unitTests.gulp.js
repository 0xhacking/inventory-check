/**
 * UNIT TESTING TASKS
 */
'use strict';

/* global __dirname */
var os = require('os');
var gulp = require('gulp');
var config = require('../gulp.config')();
var fileListParser = require('../utils/fileListParser.gulp');
var messageLogger = require('../utils/messageLogger.gulp')();
var $ = require('gulp-load-plugins')();
var args = require('yargs').argv;
var karma = require('karma').server;
var runSeq = require('run-sequence');
var log = $.util.log;
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');
var istanbul = require('istanbul');
var ll = require('gulp-ll');

var RUN_KARMA = 'run-karma-';
var RUN_KARMA_PARALLEL = 'run-karma-parallel-';
var KARMA_CONFIG = 'karma-config-';

var modules = _.keys(config.testFiles.spec);

var runKarmaParallelModules = _.chain(modules)
  .reject(function (module) {
    return module === 'all';
  })
  .map(function (module) {
    return RUN_KARMA_PARALLEL + module;
  })
  .value();
// Allow run-karma-parallel-<module> tasks to be run in individual processes
ll.tasks(runKarmaParallelModules);

/*
 * unitTests.gulp.js:
 *
 * This file creates gulp tasks to:
 *   `gulp karma-config-{module}`       ->  build individual karma-config files based on module
 *   `gulp run-karma-{module}`          ->  run individial module tests
 *   `gulp run-karma-parallel-{module}` ->  run individial module tests intended for parallel
 *   `gulp karma-{module}`              ->  [karma-config-{module} && run-karma-{module}]
 *
 *   `gulp karma-config`                ->  [karma-config-all]
 *   `gulp karma`                       ->  [karma-all]
 *
 *   `gulp karma-config-parallel`       ->  runs every karma-config-{module} in parallel
 *   `gulp karma-parallel`              ->  [karma-config-parallel] then every run-karma-parallel-{module}

 *   `gulp karma-each`                  ->  runs each karma-{module} one after another
 *
 *   `gulp karma-combine-coverage`      ->  combines cobertura coverage into a single report
 *   `gulp karma-coverage-report`       -> [karma-combine-coverage] and then opens the coverage report
 *
 *   NOTE: modules are pulled from gulp.config.js -> config.testFiles.spec
 *   NOTE: `karma-watch` tasks are in watch.gulp.js
 */

/*
 * This convenience function builds the karma-{module} tasks.
 *
 * They are used to test individual modules at one at a time
 * by runing karma-config-{module}, followed by run-karma-{module}
 */
_.forEach(modules, function (module) {
  gulp.task('karma-' + module, function (done) {
    runSeq(KARMA_CONFIG + module, RUN_KARMA + module, done);
  });
});

/*
 * This convenience function builds the run-karma-{module} tasks.
 *
 * They assume you have ran proper karma-unit-{module}.js file
 * in the proper location.
 *
 * run-karma-{module} will run karma for the karma-unit-{module}.js
 * run-karma-parallel-{module} will run karma module in its own process
 */
_.forEach(modules, function (module) {
  gulp.task(RUN_KARMA + module, createGulpRunKarmaModule(module));
  // These work nice when run by themselves, but not with other tasks
  // Keep them as separate tasks
  gulp.task(RUN_KARMA_PARALLEL + module, createGulpRunKarmaModule(module));
});

/*
 * This convenience function builds the karma-config-{module} tasks.
 *
 * This creates a karma-unit-{module}.js file and places it.
 */
_.forEach(modules, function (module) {
  gulp.task(KARMA_CONFIG + module, createGulpKarmaConfigModule(module));
});

// Dont want to break preexisting behavior
gulp.task('karma', ['karma-all'], function (done) {
  done();
});

// Dont want to break preexisting behavior
gulp.task('karma-config', function (done) {
  runSeq('karma-config-all', done);
});

// Quickly create each karma-config-{module} file
gulp.task('karma-config-parallel', karmaConfigParallelArray());

gulp.task('karma-combine-coverage', karmaCombineCoverage);
gulp.task('karma-coverage-report', ['karma-combine-coverage'], openCoverageReport);

gulp.task('karma-parallel', ['clean:coverage'], function (done) {
  runSeq(
    'karma-config-parallel',
    runKarmaParallelModules,
    done
  );
});

gulp.task('karma-each', function (done) {
  var karmaArgs = [];
  _.forEach(modules, function (module) {
    if (module !== 'all') {
      karmaArgs.push('karma-' + module);
    }
  });
  karmaArgs.push(done);
  runSeq.apply(this, karmaArgs);
});

function createGulpKarmaConfigModule(module) {
  // Compile the karma template so that changes
  // to its file array aren't managed manually
  return function (done) {
    if (!args.nounit) {
      var unitTestFiles = [].concat(
        config.vendorFiles.js,
        config.testFiles.js,
        config.testFiles.app,
        config.testFiles.global
      );

      // any other 'specs' target should already be defined in 'gulp.config.js'
      if (module !== 'custom') {
        unitTestFiles = unitTestFiles.concat(config.testFiles.spec[module]);
      } else {
        // for the 'custom' target, a '--files-from' option MUST be specified as a line-separated list of
        // files relative to the project root dir
        // (see: https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/About-Karma-Test-Selection#selecting-tests-by-custom-list-ie-gulp-karma-custom---files-from)
        var filesFrom = args['files-from'];
        var flist;
        if (!filesFrom) {
          log($.util.colors.red('Error: missing \'--files-from\' argument'));
          process.exit(1);
        } else {
          // parse each line item from file specified by '--files-from', and append to main list
          flist = fileListParser.toList(filesFrom);
          unitTestFiles = unitTestFiles.concat(flist);
        }
      }

      return gulp
        .src(config.testFiles.karmaTpl)
        .pipe($.inject(gulp.src(unitTestFiles, {
          read: false
        }), {
          addRootSlash: false,
          starttag: 'files: [',
          endtag: ',',
          transform: function (filepath, file, i, length) {
            return '\'' + filepath + '\'' + (i + 1 < length ? ',' : '');
          }
        }))
        .pipe($.replace('<module>', module))
        .pipe($.rename({
          basename: 'karma-unit-' + module,
          extname: '.js'
        }))
        .pipe($.jsbeautifier({
          config: '.jsbeautifyrc',
          mode: 'VERIFY_AND_WRITE',
          logSuccess: false
        }))
        .pipe(gulp.dest(config.test));
    } else {
      log($.util.colors.yellow('--nounit **Skipping Karma Config Task'));
      return done();
    }
  };
}

function createGulpRunKarmaModule(module) {
  // Run test once and exit
  return function (done) {
    if (!args.nounit) {
      var options = {
        configFile: path.resolve(__dirname, '../../test/karma-unit-' + module + '.js')
      };
      if (args.watch) {
        options.autoWatch = true;
        options.singleRun = false;
      } else {
        if (args.debug) {
          options.browsers = ['Chrome'];
          options.preprocessors = {};
          options.browserNoActivityTimeout = 600000;
        } else {
          options.singleRun = true;
        }
      }
      karma.start(options, function (result) {
        if (result) {
          // Exit process if we have an error code
          // Avoids having gulp formatError stacktrace
          process.exit(result);
        } else {
          // Otherwise end task like normal
          done();
        }
      });
    } else {
      log($.util.colors.yellow('--nounit **Skipping Karma Tests'));
      return done();
    }
  };
}

function karmaConfigParallelArray() {
  var karmaTasks = [];
  _.forEach(modules, function (module) {
    if (module !== 'all') {
      karmaTasks.push(KARMA_CONFIG + module);
    }
  });
  return karmaTasks;
}

function karmaCombineCoverage(done) {
  var collector = new istanbul.Collector();
  var reporter = new istanbul.Reporter(undefined, 'coverage/unit/combined/');

  glob('coverage/unit/json/*.json', {}, function (er, files) {
    _.forEach(files, function (file) {
      collector.add(JSON.parse(fs.readFileSync(file, 'utf8')));
    });

    reporter.addAll(['html', 'cobertura']);
    reporter.write(collector, true, done);
  });
}

function openCoverageReport() {
  return gulp.src('coverage/unit/combined/index.html')
    .pipe($.open());
}
