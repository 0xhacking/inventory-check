/**
 * This file/module contains all configuration for the gulp build process.
 */
'use strict';

module.exports = function() {
  var build = 'build';
  var dist = 'dist';
  var app = 'app';
  var appModules = 'app/modules';
  var test = 'test';
  var e2e = test + '/e2e-protractor';
  var tsTestOutputFolder = test + '/ts';
  var vendor = 'bower_components';
  var node_modules = 'node_modules';
  var now = new Date();
  var year = now.getFullYear();

  var config = {
    build: build,
    dist: dist,
    test: test,
    vendor: vendor,
    coverage: 'coverage',
    e2e: 'test/e2e-protractor',
    tsTestOutputFolder: tsTestOutputFolder,
    app: 'app',
    unsupportedDir: 'app/unsupported',
    fonts: 'fonts',
    images: 'images',
    css: 'styles',
    docs: 'docs',
    cssName: 'main',
    jsIndexName: 'index.scripts',
    jsUnsupportedName: 'unsupported.scripts',

    appFiles: {
      js: [
        app + '/modules/**/*.js',
        app + '/scripts/**/*.js',
        app + '!**/*.spec.js'
      ],
      ts: [app + '/**/*.ts'],
      json: [app + '/**/*.json'],
      csv: [app + '/**/*.csv'],
      docs: [app + '/docs/**/*'],
      tpl: [app + '/modules/**/*.html'],
      html: [app + '/*.html'],
      scss: ['styles/app.scss'],
      images: [app + '/images'],
      lang: [app + '/l10n/*.json'],
    },

    unsupported: {
      dir: 'unsupported',
      file: 'unsupportedApp.js',
      js: [
        app + '/unsupported/**/*.js',
      ],
      name: 'unsupported.scripts',
    },

    templateCache: {
      file: 'templates.module.js',
      options: {
        module: 'templates-app',
        standalone: true,
        moduleSystem: 'IIFE',
        root: 'modules',
      },
      dest: build + '/modules/core/templates',
    },

    typeDefs: ['typings/**/*.ts'],

    testFiles: {
      karmaTpl: 'karma/karma-conf.tpl.js',
      karmaWatchTpl: 'karma/karma.watch.tpl.js',
      app: [
        build + '/scripts/**/*.js',
        build + '/modules/**/*.module.js',
        build + '/modules/**/*.js',
        tsTestOutputFolder + '/modules/**/*.js'
      ],
      js: [
        vendor + '/angular-mocks/angular-mocks.js',
        vendor + '/jasmine-jquery/lib/jasmine-jquery.js',
        vendor + '/sinon-ng/sinon-ng.js',
        vendor + '/es5-shim/es5-shim.js',
        node_modules + '/jasmine-promise-matchers/dist/jasmine-promise-matchers.js',
        vendor + '/bardjs/dist/bard.js',
        vendor + '/jasmine-sinon/lib/jasmine-sinon.js',
      ],
      global: [
        test + '/global.spec.js',
      ],
      spec: {
        all: app + '/**/*.spec.js',
        ts: app + '/**/*.spec.ts',
        core: appModules + '/core/**/*.spec.js',
        hercules: appModules + '/hercules/**/*.spec.js',
        huron: appModules + '/huron/**/*.spec.js',
        mediafusion: appModules + '/mediafusion/**/*.spec.js',
        messenger: appModules + '/messenger/**/*.spec.js',
        squared: appModules + '/squared/**/*.spec.js',
        sunlight: appModules + '/sunlight/**/*.spec.js',
        webex: appModules + '/webex/**/*.spec.js',
      },
      e2e: {
        hercules: e2e + '/hercules/**/*_spec.js',
        huron: e2e + '/huron/**/*_spec.js',
        mediafusion: e2e + '/mediafusion/**/*_spec.js',
        squared: e2e + '/squared/**/*_spec.js',
        webex: e2e + '/webex/**/*_spec.js',
        sunlight: e2e + '/sunlight/**/*_spec.js',
        regression: e2e + '/regression/**/*_spec.js',
      }
    },

    vendorFiles: {
      unsupported: [
        vendor + '/json3/lib/json3.min.js',
        vendor + '/angular/angular.js',
        vendor + '/angular-translate/angular-translate.js',
        vendor + '/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      ],
      js: [
        vendor + '/x2js/xml2json.js',
        vendor + '/jquery/dist/jquery.js',
        vendor + '/bootstrap/dist/js/bootstrap.js',
        vendor + '/addressparser/src/addressparser.js',
        vendor + '/alertify.js/lib/alertify.js',
        vendor + '/cisco-amcharts/amcharts/amcharts.js',
        vendor + '/cisco-amcharts/amcharts/pie.js',
        vendor + '/cisco-amcharts/amcharts/serial.js',
        vendor + '/cisco-amcharts/amcharts/funnel.js',
        vendor + '/cisco-amcharts/amcharts/plugins/export/export.js',
        vendor + '/cisco-amcharts/amcharts/plugins/export/libs/fabric.js/fabric.js',
        vendor + '/cisco-amcharts/amcharts/plugins/export/libs/blob.js/blob.js',
        vendor + '/cisco-amcharts/amcharts/plugins/export/libs/jszip.js/jszip.js',
        vendor + '/cisco-amcharts/amcharts/plugins/export/libs/FileSaver.js/FileSaver.js',
        vendor + '/cisco-amcharts/amcharts/plugins/export/libs/pdfmake/pdfmake.js',
        vendor + '/cisco-amcharts/amcharts/plugins/export/libs/pdfmake/vfs_fonts.js',
        vendor + '/typeahead.js/dist/typeahead.bundle.js',
        vendor + '/lodash/lodash.min.js',
        vendor + '/draggable/draggable.min.js',
        vendor + '/moment/moment.js',
        vendor + '/base64/base64.js',
        vendor + '/nicescroll/jquery.nicescroll.js',
        vendor + '/punycode/punycode.js',
        vendor + '/angular/angular.js',
        vendor + '/angular-animate/angular-animate.js',
        vendor + '/angular-ui-utils/ui-utils.js',
        vendor + '/angular-cookie/angular-cookie.js',
        vendor + '/angular-cookies/angular-cookies.js',
        vendor + '/angular-sanitize/angular-sanitize.js',
        vendor + '/angular-dialog-service/dialogs.js',
        vendor + '/angular-resource/angular-resource.js',
        vendor + '/angular-route/angular-route.js',
        vendor + '/angular-messages/angular-messages.js',
        vendor + '/angular-translate/angular-translate.js',
        vendor + '/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        vendor + '/messageformat/messageformat.js',
        vendor + '/messageformat/locale/*.js',
        vendor + '/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
        vendor + '/angular-ui-router/release/angular-ui-router.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.core.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.sticky.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.transition.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.future.js',
        vendor + '/ui-router-extras/release/modular/ct-ui-router-extras.previous.js',
        vendor + '/ng-csv/build/ng-csv.min.js',
        vendor + '/api-check/dist/api-check.js',
        vendor + '/angular-formly/dist/formly.js',
        vendor + '/cisco-ui/dist/js/cisco-ui.js',
        vendor + '/cisco-ui/dist/js/cisco-formly.js',
        vendor + '/angular-wizard/dist/angular-wizard.js',
        vendor + '/ng-grid/build/ng-grid.js',
        vendor + '/angular-ui-grid/ui-grid.js',
        vendor + '/angular-nicescroll/angular-nicescroll.js',
        vendor + '/bootstrap-tokenfield/dist/bootstrap-tokenfield.js',
        vendor + '/moment-timezone/builds/moment-timezone-with-data-2010-2020.js',
        vendor + '/ng-clip/src/ngClip.js',
        vendor + '/zeroclipboard/dist/ZeroClipboard.js',
        vendor + '/d3/d3.min.js',
        vendor + '/jquery-csv/src/jquery.csv.js',
        vendor + '/angular-timer/dist/angular-timer.js',
        vendor + '/humanize-duration/humanize-duration.js',
        vendor + '/angular-libphonenumber/dist/libphonenumber.js',
        vendor + '/angular-libphonenumber/dist/angular-libphonenumber.js',
        vendor + '/angularjs-toaster/toaster.js',
        vendor + '/ng-file-upload/ng-file-upload.js',
        vendor + '/jstimezonedetect/jstz.js',
        vendor + '/masonry/dist/masonry.pkgd.js',
        vendor + '/imagesloaded/imagesloaded.pkgd.js',
        vendor + '/ng-tags-input/ng-tags-input.min.js',
        vendor + '/pako/dist/pako.js',
        vendor + '/angular-cache/dist/angular-cache.js',
        vendor + '/parse-address-bobbr/parse-address.min.js',
        vendor + '/clipboard/dist/clipboard.js',
        vendor + '/query-command-supported/dist/queryCommandSupported.js',
        vendor + '/ical.js/build/ical.js',
        vendor + '/angular-ical/dist/js/angular-ical.js'
      ],
      scss: {
        paths: [
          './' + vendor + '/bootstrap-sass/assets/stylesheets',
          './' + vendor + '/foundation/scss',
        ],
        files: [
          vendor + '/cisco-ui/scss/**/*.scss',
        ]
      },
      css: [
        vendor + '/alertify.js/themes/alertify.core.css',
        vendor + '/alertify.js/themes/alertify.default.css',
        vendor + '/angular-wizard/dist/angular-wizard.css',
        vendor + '/angular-dialog-service/dialogs.css',
        vendor + '/animate.css/animate.css',
        vendor + '/ng-tags-input/ng-tags-input.css',
        vendor + '/cisco-amcharts/amcharts/plugins/export/export.css',
      ],
      fonts: [
        vendor + '/cisco-ui/dist/fonts/*',
        vendor + '/font-awesome/fonts/*',
      ],
      images: [
        vendor + '/cisco-ui/dist/images/*',
      ]
    },

    banner: '/**\n' +
      ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
      ' * Copyright ' + year + ' <%= pkg.author %>\n' +
      ' */\n' +
      '',

    isJenkins: isJenkins,
  };

  return config;

  ////////////////

  function isJenkins() {
    return process.env.BUILD_NUMBER && process.env.JOB_NAME && process.env.JENKINS_URL;
  }
};
