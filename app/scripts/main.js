(function () {
  'use strict';

  require('./main.dependencies');

  angular.module('Core', [
    'angular-cache',
    'atlas.templates',
    'cisco.ui',
    'cisco.formly',
    'core.auth',
    'core.body',
    'core.languages',
    'core.localize',
    'core.logmetricsservice',
    'core.notifications',
    'core.onboard',
    'core.pageparam',
    'core.previousstate',
    'core.token',
    'core.trackingId',
    'core.trial',
    'core.utils',
    'core.windowlocation',
    'csDonut',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.future',
    'ct.ui.router.extras.previous',
    'cwill747.phonenumber',
    'ngAnimate',
    'ngclipboard',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngMessages',
    'ngFileUpload',
    'ngCsv',
    'pascalprecht.translate',
    'ui.router',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.saveState',
    'ui.grid.infiniteScroll',
    'timer',
    'toaster',
    'dragularModule',
    require('modules/core/featureToggle/featureToggle.service'),
    require('modules/core/scripts/services/org.service'),
    require('modules/online/digitalRiver').default // TODO make core.myCompany independent module
  ])
    .constant('pako', require('pako'))
    .constant('phone', require('google-libphonenumber'))
    .constant('addressparser', require('emailjs-addressparser'));

  // TODO fix circular dependencies between modules
  angular.module('Squared', ['Core', 'Hercules', 'Huron', 'Sunlight']);

  angular.module('DigitalRiver', ['Core']);

  angular.module('Huron', [
    'Core',
    'uc.device',
    'uc.callrouting',
    'uc.didadd',
    'uc.overview',
    'uc.hurondetails',
    'uc.cdrlogsupport',
    'ngIcal',
    require('modules/huron/telephony/telephonyConfig'),
  ]);

  angular.module('Hercules', ['Core', 'Squared', 'core.onboard', 'ngTagsInput']);

  angular.module('Ediscovery', ['Core']);

  angular.module('Mediafusion', ['Core', 'Hercules', 'Squared']);

  angular.module('WebExApp', ['Core']);

  angular.module('Messenger', ['Core']);

  angular.module('Sunlight', [
    'Core',
    'CareDetails'
  ]);

  angular.module('Status.incidents', ['Core']);

  angular.module('Status', ['Core', 'Status.incidents']);

  module.exports = angular.module('Main', [
    'Core',
    'Squared',
    'DigitalRiver',
    'Huron',
    'Hercules',
    'Ediscovery',
    'Mediafusion',
    'WebExApp',
    'Messenger',
    'Sunlight',
    'Status',
    'oc.lazyLoad',
  ]).config(require('./main.config'))
    .run(require('./main.run'))
    .name;

  // require all modules first
  requireAll(require.context("modules/", true, /\.module\.(js|ts)$/));
  // require all other app files - ignore bootstrap.js and preload.js
  requireAll(require.context("../", true, /\.\/(?!.*(\.spec|bootstrap.js$|scripts\/preload.js$)).*\.(js|ts)$/));
  // require all other assets
  requireAll(require.context("../", true, /\.(jpg|png|svg|ico|json|csv|pdf)$/));

  function requireAll(requireContext) {
    return requireContext.keys().forEach(requireContext);
  }
}());
