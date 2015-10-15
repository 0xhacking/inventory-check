'use strict';

/**
 * @ngdoc overview
 * @name adminPortalPocApp
 * @description
 * # adminPortalPocApp
 *
 * Main module of the application.
 */

angular.module('Core', [
  'pascalprecht.translate',
  'templates-app',
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngMessages',
  'ngFileUpload',
  // 'ui.bootstrap',
  'dialogs',
  'ngCsv',
  'ipCookie',
  'ui.router',
  'ct.ui.router.extras.sticky',
  'ct.ui.router.extras.previous',
  'ngGrid',
  'mgo-angular-wizard',
  'ngClipboard',
  'csDonut',
  'formly',
  'formlyCisco',
  'cisco.ui',
  'timer',
  'angular-nicescroll',
  'cwill747.phonenumber',
  'toaster'
]);

angular.module('Squared', ['Core']);

angular.module('Huron', ['Core', 'uc.moh', 'uc.device', 'uc.callrouting', 'uc.didadd', 'uc.overview', 'uc.callrouter', 'uc.hurondetails', 'uc.cdrlogsupport', 'uc.huntGroup']);

angular.module('Hercules', ['Core']);

angular.module('Mediafusion', ['Core']);

angular.module('WebExUtils', ['Core']);
angular.module('WebExXmlApi', ['Core']);

angular.module('WebExSiteSettings', ['Core']);
angular.module('WebExSiteSetting', ['Core']);

angular.module('WebExReports', ['Core']);
angular.module('ReportIframe', ['Core']);

angular.module('WebExUserSettings', ['Core']);
angular.module('WebExUserSettings2', ['Core']);

angular.module('Messenger', ['Core']);

angular.module('Sunlight', ['Core']);

angular.module('wx2AdminWebClientApp', [
  'Core',
  'Squared',
  'Huron',
  'Hercules',
  'Mediafusion',
  'WebExUtils',
  'WebExXmlApi',
  'WebExSiteSettings',
  'WebExSiteSetting',
  'WebExUserSettings',
  'WebExUserSettings2',
  'WebExReports',
  'ReportIframe',
  'Messenger',
  'Sunlight'
]);
