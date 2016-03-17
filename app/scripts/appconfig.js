'use strict';
angular
  .module('wx2AdminWebClientApp')
  .config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$translateProvider', '$compileProvider',
    function ($httpProvider, $stateProvider, $urlRouterProvider, $translateProvider, $compileProvider) {
      var sidepanelMemo = 'sidepanelMemo';

      // sidepanel helper
      function isStateInSidepanel($state) {
        var rootStateName = $state.current.name.split('.')[0];
        var rootState = $state.get(rootStateName);
        var rootStateIsSidepanel = rootState.parent === 'sidepanel';
        return $state.current.parent === 'sidepanel' || (rootStateIsSidepanel && $state.includes(rootState));
      }

      //Add blob to the default angular whitelist
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);

      $urlRouterProvider.otherwise('login');
      $stateProvider
        .state('login', {
          url: '/login',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('enterEmailAddr', {
          url: '/enter-email-addr',
          views: {
            'main@': {
              templateUrl: 'modules/digitalRiver/login/enterEmailAddr/enterEmailAddr.tpl.html',
              controller: 'enterEmailAddrController',
              controllerAs: 'enterEmailAddrController'
            }
          },
          authenticate: false
        })
        .state('dr-login-forward', {
          url: '/dr-login-forward',
          views: {
            'main@': {
              templateUrl: 'modules/digitalRiver/login/drLoginForward/drLoginForward.tpl.html',
              controller: 'drLoginForwardController',
              controllerAs: 'drLoginForwardController'
            }
          }
        })
        .state('createAccount', {
          url: '/create-account',
          views: {
            'main@': {
              templateUrl: 'modules/digitalRiver/login/createAccount/createAccount.tpl.html',
              controller: 'createAccountController',
              controllerAs: 'createAccountController'
            }
          },
          authenticate: false
        })
        .state('activateUser', {
          url: '/activate-user',
          views: {
            'main@': {
              template: '<div ui-view></div>',
              controller: 'ActivateUserController'
            }
          },
          authenticate: false
        })
        .state('activateUser.successPage', {
          url: '/success-page',
          views: {
            'main@': {
              template: '<div ui-view></div>'
            }
          },
          authenticate: false
        })
        .state('activateUser.errorPage', {
          url: '/error-page',
          views: {
            'main@': {
              template: '<div ui-view></div>'
            }
          },
          authenticate: false
        })
        .state('activateProduct', {
          url: '/activate-product',
          views: {
            'main@': {
              template: '<div ui-view></div>',
              controller: 'ActivateProductController'
            }
          }
        })
        .state('activateProduct.successPage', {
          url: '/success-page',
          views: {
            'main@': {
              template: '<div ui-view></div>'
            }
          }
        })
        .state('activateProduct.errorPage', {
          url: '/error-page',
          views: {
            'main@': {
              template: '<div ui-view></div>'
            }
          }
        })
        .state('unauthorized', {
          views: {
            'main@': {
              templateUrl: 'modules/core/stateRedirect/unauthorized.tpl.html',
              controller: 'StateRedirectCtrl',
              controllerAs: 'stateRedirect'
            }
          },
          authenticate: false
        })
        .state('login-error', {
          views: {
            'main@': {
              templateUrl: 'modules/core/stateRedirect/loginError.tpl.html',
              controller: 'StateRedirectCtrl',
              controllerAs: 'stateRedirect'
            }
          },
          authenticate: false
        })
        .state('404', {
          url: '/404',
          views: {
            'main@': {
              templateUrl: 'modules/core/stateRedirect/404.tpl.html',
              controller: 'StateRedirectCtrl',
              controllerAs: 'stateRedirect'
            }
          },
          authenticate: false
        })
        .state('main', {
          views: {
            'main@': {
              templateUrl: 'modules/core/views/main.tpl.html'
            }
          },
          abstract: true,
          sticky: true
        })
        .state('partner', {
          template: '<div ui-view></div>',
          url: '/partner',
          parent: 'main',
          abstract: true
        })
        .state('sidepanel', {
          abstract: true,
          onEnter: /* @ngInject */ function ($modal, $state, $previousState) {
            if ($state.sidepanel) {
              $state.sidepanel.stopPreviousState = true;
            } else {
              $previousState.memo(sidepanelMemo);
            }
            $state.sidepanel = $modal.open({
              template: '<cs-sidepanel></cs-sidepanel>',
              windowTemplateUrl: 'sidepanel/sidepanel-modal.tpl.html',
              backdrop: false,
              keyboard: false
            });
            $state.sidepanel.result.finally(function () {
              if (!this.stopPreviousState && !$state.modal) {
                $state.sidepanel = null;
                var previousState = $previousState.get(sidepanelMemo);
                if (previousState) {
                  if (isStateInSidepanel($state)) {
                    return $previousState.go(sidepanelMemo).then(function () {
                      $previousState.forget(sidepanelMemo);
                    });
                  }
                }
              }
            }.bind($state.sidepanel));
          },
          onExit: /* @ngInject */ function ($state, $previousState) {
            if ($state.sidepanel) {
              $state.sidepanel.dismiss();
            }
          }
        });

      $httpProvider.interceptors.push('TrackingIdInterceptor');
      $httpProvider.interceptors.push('ResponseInterceptor');
      $httpProvider.interceptors.push('TimingInterceptor');

      // See ... http://angular-translate.github.io/docs/#/guide/19_security
      $translateProvider.useSanitizeValueStrategy('escapeParameters');

      $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
      });

      $translateProvider.addInterpolation('$translateMessageFormatInterpolation');

      var defaultLang = 'en_US';

      //Tell the module what language to use by default
      $translateProvider.preferredLanguage(defaultLang);
    }
  ]);

angular
  .module('Squared')
  .config(['$urlRouterProvider', '$stateProvider', '$futureStateProvider',
    function ($urlRouterProvider, $stateProvider, $futureStateProvider) {
      var modalMemo = 'modalMemo';
      var wizardmodalMemo = 'wizardmodalMemo';

      // Modal States Enter and Exit functions
      function modalOnEnter(options) {
        options = options || {};
        /* @ngInject */
        return function ($modal, $state, $previousState) {
          if ($state.modal) {
            $state.modal.stopPreviousState = true;
          } else {
            $previousState.memo(modalMemo);
          }
          $state.modal = $modal.open({
            template: '<div ui-view="modal"></div>',
            size: options.size,
            windowClass: options.windowClass,
            backdrop: options.backdrop || 'static'
          });
          $state.modal.result.finally(function () {
            if (!this.stopPreviousState) {
              $state.modal = null;
              var previousState = $previousState.get(modalMemo);
              if (previousState) {
                return $previousState.go(modalMemo).then(function () {
                  $previousState.forget(modalMemo);
                });
              }
            }
          }.bind($state.modal));
        };
      }

      /* @ngInject */
      function modalOnExit($state, $previousState) {
        if ($state.modal) {
          $state.modal.dismiss();
        }
      }

      $stateProvider
        .state('activate', {
          url: '/activate',
          views: {
            'main@': {
              templateUrl: 'modules/squared/views/activate.html',
              controller: 'ActivateCtrl'
            }
          },
          authenticate: false
        })
        .state('csadmin', {
          url: '/csadmin?eqp',
          templateUrl: 'modules/squared/csadmin/csadmin.html',
          controller: 'CsAdminCtrl',
          parent: 'main'
        })
        .state('downloads', {
          url: '/downloads',
          views: {
            'main@': {
              templateUrl: 'modules/squared/views/downloads.html',
              controller: 'DownloadsCtrl'
            }
          },
          authenticate: false
        })
        .state('domainmanagement', {
          templateUrl: 'modules/core/domainManagement/domainManagement.tpl.html',
          controller: 'DomainManagementCtrl',
          controllerAs: 'dv',
          parent: 'main'
        })
        .state('domainmanagement.add', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'DomainManageAddCtrl',
              controllerAs: 'dmpopup',
              templateUrl: 'modules/core/domainManagement/add.tpl.html'
            }
          },
          params: {
            loggedOnUser: null
          }
        })
        .state('domainmanagement.instructions', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'DomainManageInstructionsCtrl',
              controllerAs: 'dmpopup',
              templateUrl: 'modules/core/domainManagement/instructions.tpl.html'
            }
          },
          params: {
            domain: null,
            loggedOnUser: null
          }
        })
        .state('domainmanagement.delete', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'DomainManageDeleteCtrl',
              controllerAs: 'dmpopup',
              templateUrl: 'modules/core/domainManagement/delete.tpl.html'
            }
          },
          params: {
            domain: null,
            loggedOnUser: null
          }
        })
        .state('domainmanagement.unclaim', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'DomainManageDeleteCtrl',
              controllerAs: 'dmpopup',
              templateUrl: 'modules/core/domainManagement/unclaim.tpl.html'
            }
          },
          params: {
            domain: null,
            loggedOnUser: null
          }
        })
        .state('domainmanagement.claim', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'DomainManageClaimCtrl',
              controllerAs: 'dmpopup',
              templateUrl: 'modules/core/domainManagement/claim.tpl.html'
            }
          },
          params: {
            domain: null,
            loggedOnUser: null
          }
        })
        .state('domainmanagement.verify', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'DomainManageVerifyCtrl',
              controllerAs: 'dmpopup',
              templateUrl: 'modules/core/domainManagement/verify.tpl.html'
            }
          },
          params: {
            domain: null,
            loggedOnUser: null
          }
        })
        .state('profile', {
          url: '/profile',
          templateUrl: 'modules/core/partnerProfile/partnerProfile.tpl.html',
          controller: 'PartnerProfileCtrl',
          parent: 'main'
        })
        .state('invite', {
          url: '/invite',
          views: {
            'main@': {
              templateUrl: 'modules/squared/views/invite.html',
              controller: 'InviteCtrl'
            }
          },
          authenticate: false
        })
        .state('invitelauncher', {
          url: '/invitelauncher',
          templateUrl: 'modules/squared/views/invitelauncher.html',
          controller: 'InvitelauncherCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('applauncher', {
          url: '/applauncher',
          templateUrl: 'modules/squared/views/applauncher.html',
          controller: 'ApplauncherCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('appdownload', {
          url: '/appdownload',
          templateUrl: 'modules/squared/views/appdownload.html',
          controller: 'AppdownloadCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('processorder', {
          url: '/processorder',
          templateUrl: 'modules/squared/views/processorder.html',
          controller: 'ProcessorderCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('overview', {
          url: '/overview',
          templateUrl: 'modules/core/overview/overview.tpl.html',
          controller: 'OverviewCtrl',
          controllerAs: 'overview',
          parent: 'main'
        })
        .state('users', {
          abstract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('users.list', {
          url: '/users',
          templateUrl: 'modules/core/users/userList/userList.tpl.html',
          controller: 'UserListCtrl',
          params: {
            showAddUsers: {}
          }
        })
        .state('users.delete', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'UserDeleteCtrl',
              controllerAs: 'userDelete',
              templateUrl: 'modules/core/users/userDelete/userDelete.tpl.html'
            }
          },
          params: {
            deleteUserOrgId: null,
            deleteUserUuId: null,
            deleteUsername: null,
          }
        })
        .state('users.deleteSelf', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'UserDeleteCtrl',
              controllerAs: 'userDelete',
              templateUrl: 'modules/core/users/userDelete/userDeleteSelf.tpl.html'
            }
          },
          params: {
            deleteUserOrgId: null,
            deleteUserUuId: null,
            deleteUsername: null
          }
        })
        .state('users.add', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OnboardCtrl',
              template: '<div ui-view="usersAdd"></div>'
            },
            'usersAdd@users.add': {
              templateUrl: 'modules/core/users/userAdd/onboardUsersModal.tpl.html'
            }
          }
        })
        .state('users.add.services', {
          views: {
            'usersAdd@users.add': {
              templateUrl: 'modules/core/users/userAdd/assignServicesModal.tpl.html'
            }
          }
        })
        .state('users.add.services.dn', {
          views: {
            'usersAdd@users.add': {
              templateUrl: 'modules/huron/users/assignDnAndDirectLinesModal.tpl.html'
            }
          }
        })
        .state('users.convert', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OnboardCtrl',
              template: '<div ui-view="usersConvert"></div>'
            },
            'usersConvert@users.convert': {
              templateUrl: 'modules/core/convertUsers/convertUsersModal.tpl.html'
            }
          }
        })
        .state('users.convert.services', {
          views: {
            'usersConvert@users.convert': {
              templateUrl: 'modules/core/users/userAdd/assignServicesModal.tpl.html'
            }
          }
        })
        .state('users.convert.services.dn', {
          views: {
            'usersConvert@users.convert': {
              templateUrl: 'modules/huron/users/assignDnAndDirectLinesModal.tpl.html'
            }
          }
        })
        // lhsieh
        .state('editService', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OnboardCtrl',
              templateUrl: 'modules/core/users/userPreview/editServices.tpl.html'
            }
          },
          params: {
            currentUser: {}
          }
        })
        .state('user-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'UserOverviewCtrl',
              controllerAs: 'userOverview',
              templateUrl: 'modules/core/users/userOverview/userOverview.tpl.html'
            },
            'header@user-overview': {
              templateUrl: 'modules/core/users/userOverview/userHeader.tpl.html'
            }
          },
          resolve: {
            currentUser: /* @ngInject */ function ($http, $stateParams, Config, Utils, Authinfo, UrlConfig) {
              var userUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + $stateParams.currentUser.id;

              return $http.get(userUrl)
                .then(function (response) {
                  angular.copy(response.data, this.currentUser);
                  this.entitlements = Utils.getSqEntitlements(this.currentUser);
                  return response.data;
                }.bind($stateParams));
            }
          },
          params: {
            currentUser: {},
            entitlements: {},
            queryuserslist: {}
          },
          data: {
            displayName: 'Overview'
          }
        })
        .state('user-overview.communication', {
          templateUrl: 'modules/huron/overview/telephonyOverview.tpl.html',
          controller: 'TelephonyOverviewCtrl',
          controllerAs: 'telephonyOverview',
          params: {
            reloadToggle: false
          },
          data: {
            displayName: 'Call'
          }
        })
        .state('user-overview.communication.directorynumber', {
          templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
          controller: 'LineSettingsCtrl',
          controllerAs: 'lineSettings',
          params: {
            directoryNumber: {}
          },
          data: {
            displayName: 'Line Configuration'
          }
        })
        .state('user-overview.device', {
          params: {
            device: {}
          },
          data: {
            displayName: 'Device Configuration'
          },
          views: {
            'header@user-overview': {
              templateUrl: 'modules/huron/device/deviceHeader.tpl.html',
              controller: 'DeviceHeaderCtrl',
              controllerAs: 'device'
            },
            '': {
              templateUrl: 'modules/huron/device/deviceDetail.tpl.html',
              controller: 'DeviceDetailCtrl',
              controllerAs: 'ucDeviceDetail'
            }
          }
        })
        .state('user-overview.communication.voicemail', {
          template: '<div uc-voicemail></div>',
          data: {
            displayName: 'Voicemail'
          }
        })
        .state('user-overview.communication.snr', {
          template: '<div uc-single-number-reach></div>',
          data: {
            displayName: 'Single Number Reach'
          }
        })
        .state('user-overview.communication.internationalDialing', {
          template: '<div uc-international-dialing></div>',
          data: {
            displayName: 'International Dialing'
          }
        })
        .state('user-overview.messaging', {
          templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
          controller: 'UserPreviewCtrl',
          data: {
            displayName: 'Message'
          },
          params: {
            service: 'MESSAGING'
          }
        })
        .state('user-overview.hybrid-services-squared-fusion-cal', {
          templateUrl: 'modules/hercules/hybridServices/hybridServicesPreview.tpl.html',
          controller: 'HybridServicesPreviewCtrl',
          data: {
            displayName: 'Calendar Service'
          },
          params: {
            extensionId: {}
          }
        })
        .state('user-overview.hybrid-services-squared-fusion-uc', {
          templateUrl: 'modules/hercules/hybridServices/callServicePreview.tpl.html',
          controller: 'CallServicePreviewCtrl',
          data: {
            displayName: 'Call Service'
          },
          params: {
            extensionId: {}
          }
        })
        .state('user-overview.conferencing', {
          templateUrl: 'modules/core/users/userPreview/conferencePreview.tpl.html',
          controller: 'ConferencePreviewCtrl',
          controllerAs: 'confPreview',
          data: {
            displayName: 'Meeting'
          },
          params: {
            service: 'CONFERENCING'
          }
        })
        .state('user-overview.conferencing.webex', {
          templateUrl: 'modules/webex/userSettings/userSettings.tpl.html',
          controller: 'WebExUserSettingsCtrl',
          data: {
            displayName: 'Session Enablement'
          },
          params: {
            currentUser: {},
            site: {}
          }
        })
        .state('user-overview.conferencing.webex.webex2', {
          templateUrl: 'modules/webex/userSettings/userSettings2.tpl.html',
          controller: 'WebExUserSettings2Ctrl',
          data: {
            displayName: 'Privileges'
          },
          params: {
            currentUser: {},
            site: {}
          }
        })
        .state('user-overview.contactCenter', {
          templateUrl: 'modules/sunlight/users/userOverview/sunlightUserOverview.tpl.html',
          controller: 'SunlightUserOverviewCtrl',
          controllerAs: 'SunlightUserOverview',
          data: {
            displayName: 'Care'
          },
          params: {
            service: 'CONTACTCENTER'
          }
        })
        .state('user-overview.userProfile', {
          templateUrl: 'modules/core/users/userRoles/userRoles.tpl.html',
          controller: 'UserRolesCtrl',
          data: {
            displayName: 'Roles'
          }
        })

      // .state('users.list.preview', {
      //     templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
      //     controller: 'UserPreviewCtrl'
      //   })
      //   .state('users.list.preview.conversations', {
      //     template: '<div user-entitlements current-user="currentUser" entitlements="entitlements" queryuserslist="queryuserslist"></div>'
      //   })
      //   .state('users.list.preview.roles', {
      //     template: '<div class="sub-details-full" user-roles current-user="currentUser" entitlements="entitlements" roles="roles" queryuserslist="queryuserslist"></div>'
      //   })
      //   .state('users.list.preview.directorynumber', {
      //     templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
      //     controller: 'LineSettingsCtrl',
      //     controllerAs: 'lineSettings',
      //     params: {
      //       showAddUsers: {},
      //       directoryNumber: {}
      //     }
      //   })
      //   .state('users.list.preview.voicemail', {
      //     template: '<div uc-voicemail></div>'
      //   })
      //   .state('users.list.preview.snr', {
      //     template: '<div uc-single-number-reach></div>'
      //   })
      //   .state('users.list.preview.device', {
      //     templateUrl: 'modules/huron/device/deviceDetail.tpl.html',
      //     controller: 'DeviceDetailCtrl',
      //     controllerAs: 'ucDeviceDetail',
      //     params: {
      //       showAddUsers: {},
      //       device: {}
      //     }
      //   })
      .state('groups', {
          abstract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('groups.list', {
          url: '/groups',
          templateUrl: 'modules/core/groups/groupList/groupList.tpl.html',
          controller: 'ListGroupsCtrl'
        })
        .state('groups.list.preview', {
          templateUrl: 'modules/core/groups/groupPreview/groupPreview.tpl.html',
          controller: 'GroupPreviewCtrl'
        })
        .state('organizations', {
          url: '/organizations',
          templateUrl: 'modules/core/organizations/organizationList/organizationList.tpl.html',
          controller: 'ListOrganizationsCtrl',
          parent: 'main'
        })
        .state('organization-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'OrganizationOverviewCtrl',
              controllerAs: 'orgOverview',
              templateUrl: 'modules/core/organizations/organizationOverview/organizationOverview.tpl.html'
            },
            'header@organization-overview': {
              templateUrl: 'modules/core/organizations/organizationOverview/organizationHeader.tpl.html'
            }
          },
          params: {
            currentOrganization: null
          },
          data: {
            displayName: 'Overview'
          }
        })
        .state('organization-overview.features', {
          templateUrl: 'modules/core/organizations/organizationFeatures/organizationFeatures.tpl.html',
          controller: 'OrganizationFeaturesCtrl',
          controllerAs: 'features',
          params: {
            reloadToggle: false
          },
          data: {
            displayName: 'Beta Features'
          }
        })
        .state('organization-overview.add', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              controller: 'OrganizationAddCtrl',
              controllerAs: 'orgAdd',
              template: '<div ui-view="orgAdd"></div>'
            },
            'orgAdd@organization-overview.add': {
              templateUrl: 'modules/core/organizations/organizationAdd/organizationAdd.tpl.html'
            }
          }
        })
        .state('organization-overview.add.info', {
          templateUrl: 'modules/core/organizations/organizationAdd/organizationAdd.tpl.html'
        })
        .state('organization-overview.add.addNumbers', {
          templateUrl: 'modules/core/organizations/organizationAdd/addNumbers.tpl.html',
          controller: 'DidAddCtrl',
          controllerAs: 'didAdd',
          params: {
            currentTrial: {},
            currentOrg: {}
          }
        })
        .state('site-list', {
          url: '/site-list',
          templateUrl: 'modules/core/siteList/siteList.tpl.html',
          controller: 'SiteListCtrl',
          controllerAs: 'siteList',
          parent: 'main'
        })
        // lhsieh
        .state('site-csv-results', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'SiteCSVResultsCtrl',
              templateUrl: 'modules/webex/siteCSVResults/siteCSVResultsModal.tpl.html',
            }
          },
          params: {
            siteRow: null
          }
        })
        .state('site-list.site-settings', {
          templateUrl: 'modules/webex/siteSettings/siteSettings.tpl.html',
          controller: 'WebExSiteSettingsCtrl',
          parent: 'main',
          params: {
            siteUrl: null
          }
        })
        .state('site-list.site-setting', {
          templateUrl: 'modules/webex/siteSetting/siteSetting.tpl.html',
          controller: 'WebExSiteSettingCtrl',
          parent: 'main',
          params: {
            siteUrl: null,
            webexPageId: null,
            settingPageIframeUrl: null
          }
        })
        .state('reports', {
          url: '/reports',
          templateUrl: 'modules/core/customerReports/customerReports.tpl.html',
          controller: 'CustomerReportsCtrl',
          controllerAs: 'nav',
          parent: 'main',
          params: {
            tab: null,
            siteUrl: null
          }
        })
        .state('webex-reports', {
          url: '/reports/webex',
          templateUrl: 'modules/core/customerReports/customerReports.tpl.html',
          controller: 'CustomerReportsCtrl',
          controllerAs: 'nav',
          parent: 'main',
          params: {
            tab: 'webex',
            siteUrl: null
          }
        })
        .state('webex-reports.webex-reports-iframe', {
          templateUrl: 'modules/webex/siteReportsIframe/siteReportIframe.tpl.html',
          controller: 'ReportsIframeCtrl',
          parent: 'main',
          params: {
            siteUrl: null,
            reportPageId: null,
            reportPageIframeUrl: null
          },
          data: {
            displayName: 'Reports Page2'
          }
        })
        .state('userprofile', {
          url: '/userprofile/:uid',
          templateUrl: 'modules/squared/views/userprofile.html',
          controller: 'UserProfileCtrl',
          parent: 'main'
        })
        .state('support', {
          url: '/support',
          templateUrl: 'modules/squared/support/support.html',
          controller: 'SupportCtrl',
          parent: 'main'
        })
        .state('support.status', {
          url: '/status',
          views: {
            'supportPane': {
              templateUrl: 'modules/squared/support/support-status.html',
              controller: 'SupportCtrl',
              controllerAs: 'support'
            }
          }
        })
        .state('support.logs', {
          url: '/logs?search',

          views: {
            'supportPane': {
              templateUrl: 'modules/squared/support/support-logs.html',
              controller: 'SupportCtrl',
            }
          }
        })
        .state('support.billing', {
          url: '/billing?enc',
          views: {
            'supportPane': {
              templateUrl: 'modules/squared/support/support-billing.html',
              controller: 'BillingCtrl'
            }
          }

        })
        .state('billing', {
          url: '/orderprovisioning?enc',
          templateUrl: 'modules/squared/support/billing.tpl.html',
          controller: 'BillingCtrl',
          parent: 'main'
        })

      /*
        devices
      */

      .state('devices', {
          url: '/devices',
          templateUrl: 'modules/squared/devices/devices.html',
          controller: 'DevicesCtrl',
          controllerAs: 'sc',
          parent: 'main',
          data: {
            bodyClass: 'devices-page'
          }
        })
        .state('device-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'DeviceOverviewCtrl',
              controllerAs: 'deviceOverview',
              templateUrl: 'modules/squared/devices/overview/deviceOverview.tpl.html'
            },
            'header@device-overview': {
              templateUrl: 'modules/squared/devices/overview/deviceHeader.tpl.html'
            }
          },
          resolve: {
            channels: /* @ngInject */ function (CsdmUpgradeChannelService) {
              return CsdmUpgradeChannelService.getUpgradeChannelsPromise();
            }
          },
          params: {
            currentDevice: {}
          },
          data: {
            displayName: 'Overview'
          }
        })
        .state('video', {
          parent: 'modalLarge',
          views: {
            'modal@': {
              templateUrl: 'modules/core/video/videoModal.tpl.html'
            }
          }
        })

      /*
       devices
       prototypes
      */
      .state('main-redux', {
          views: {
            'main@': {
              templateUrl: 'modules/squared/mainRedux/main-redux.html'
            }
          },
          abstract: true,
          sticky: true
        })
        .state('devices-redux', {
          abstract: true,
          templateUrl: 'modules/squared/devicesRedux/devices.html',
          controller: 'DevicesReduxCtrl',
          controllerAs: 'devices',
          parent: 'main-redux'
        })
        .state('devices-redux.search', {
          url: '/devices-redux',
          views: {
            'leftPanel': {
              templateUrl: 'modules/squared/devicesRedux/list.html'
            }
          }
        })
        .state('devices-redux.details', {
          url: '/devices-redux/details',
          views: {
            'leftPanel': {
              controllerAs: 'deviceDetails',
              controller: 'DevicesReduxDetailsCtrl',
              templateUrl: 'modules/squared/devicesRedux/details.html'
            }
          },
          params: {
            device: null
          }
        })
        /*
          end: devices redux prototypes
        */
        .state('partneroverview', {
          parent: 'partner',
          url: '/overview',
          templateUrl: 'modules/core/views/partnerlanding.html',
          controller: 'PartnerHomeCtrl'
        })
        .state('partnerreports', {
          parent: 'partner',
          url: '/reports',
          templateUrl: 'modules/core/partnerReports/partnerReports.tpl.html',
          controller: 'PartnerReportCtrl',
          controllerAs: 'nav'
        })
        .state('login_swap', {
          url: '/login/:customerOrgId/:customerOrgName',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('launch_partner_org', {
          url: '/login/:partnerOrgId/:partnerOrgName/:launchPartner',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('partnercustomers', {
          parent: 'partner',
          template: '<div ui-view></div>',
          absract: true
        })
        .state('partnercustomers.list', {
          url: '/customers',
          templateUrl: 'modules/core/customers/customerList/customerList.tpl.html',
          controller: 'PartnerHomeCtrl',
          params: {
            filter: null
          }
        })
        .state('customer-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'CustomerOverviewCtrl',
              controllerAs: 'customerOverview',
              templateUrl: 'modules/core/customers/customerOverview/customerOverview.tpl.html'
            }
          },
          resolve: {
            identityCustomer: /* @ngInject */ function ($stateParams, $q, Orgservice) {
              var defer = $q.defer();
              if ($stateParams.currentCustomer) {
                Orgservice.getOrg(orgCallback, $stateParams.currentCustomer.customerOrgId);
              }

              return defer.promise;

              function orgCallback(data, status) {
                defer.resolve(data);
              }
            }
          },
          params: {
            currentCustomer: {}
          },
          data: {
            displayName: 'Overview'
          }
        })
        .state('customer-overview.externalNumbers', {
          controller: 'ExternalNumberDetailCtrl',
          controllerAs: 'externalNumbers',
          templateUrl: 'modules/huron/externalNumbers/externalNumberDetail.tpl.html',
          data: {
            displayName: 'Phone Numbers'
          }
        })
        .state('modal', {
          abstract: true,
          onEnter: modalOnEnter(),
          onExit: modalOnExit
        })
        .state('modalLarge', {
          abstract: true,
          onEnter: modalOnEnter({
            size: 'lg'
          }),
          onExit: modalOnExit
        })
        .state('modalSmall', {
          abstract: true,
          onEnter: modalOnEnter({
            size: 'sm'
          }),
          onExit: modalOnExit
        })
        .state('modalFull', {
          abstract: true,
          onEnter: modalOnEnter({
            windowClass: 'modal-full',
            backdrop: 'static'
          }),
          onExit: modalOnExit
        })
        .state('wizardmodal', {
          abstract: true,
          onEnter: ['$modal', '$state', '$previousState',
            function ($modal, $state, $previousState) {
              $previousState.memo(wizardmodalMemo);
              $state.modal = $modal.open({
                template: '<div ui-view="modal"></div>',
                controller: 'ModalWizardCtrl',
                windowTemplateUrl: 'modules/core/modal/wizardWindow.tpl.html',
                backdrop: 'static'
              });
              $state.modal.result.finally(function () {
                $state.modal = null;
                var previousState = $previousState.get(wizardmodalMemo);
                if (previousState) {
                  return $previousState.go(wizardmodalMemo);
                }
              });
            }
          ],
          onExit: ['$state', '$previousState',
            function ($state, $previousState) {
              if ($state.modal) {
                $previousState.forget(wizardmodalMemo);
                $state.modal.close();
              }
            }
          ]
        })
        .state('firsttimesplash', {
          abstract: true,
          views: {
            'main@': {
              templateUrl: 'modules/core/setupWizard/firstTimeWizard.tpl.html',
              controller: 'FirstTimeWizardCtrl'
            }
          }
        })
        .state('firsttimewizard', {
          parent: 'firsttimesplash',
          template: '<cr-wizard tabs="tabs" finish="finish" is-first-time="true"></cr-wizard>',
          controller: 'SetupWizardCtrl',
          data: {
            firstTimeSetup: true
          }
        })
        .state('setupwizardmodal', {
          parent: 'wizardmodal',
          views: {
            'modal@': {
              template: '<cr-wizard tabs="tabs" finish="finish"></cr-wizard>',
              controller: 'SetupWizardCtrl'
            }
          },
          params: {
            currentTab: {}
          },
          data: {
            firstTimeSetup: false
          }
        })
        .state('trialExtInterest', {
          url: '/trialExtInterest?eqp',
          templateUrl: 'modules/core/trialExtInterest/trialExtInterest.tpl.html',
          controller: 'TrialExtInterestCtrl',
          controllerAs: 'extInterest',
          parent: 'main'
        })
        .state('helpdesk-main', {
          views: {
            'main@': {
              controller: 'HelpdeskHeaderController',
              controllerAs: 'helpdeskHeaderCtrl',
              templateUrl: 'modules/squared/helpdesk/helpdesk.tpl.html'
            }
          },
          abstract: true,
          sticky: true
        })
        .state('helpdesklaunch', {
          url: '/helpdesklaunch',
          templateUrl: 'modules/squared/helpdesk/helpdesk-launch.html',
          parent: 'main'
        })
        .state('helpdesk', {
          url: '/helpdesk',
          template: '<div ui-view></div>',
          controller: 'HelpdeskController',
          controllerAs: 'helpdeskCtrl',
          parent: 'helpdesk-main'
        })
        .state('helpdesk.search', {
          url: '/',
          templateUrl: 'modules/squared/helpdesk/helpdesk-search.html'
        })
        .state('helpdesk.user', {
          url: '/user/:orgId/:id',
          templateUrl: 'modules/squared/helpdesk/helpdesk-user.html',
          controller: 'HelpdeskUserController',
          controllerAs: 'helpdeskUserCtrl',
          params: {
            user: null,
            id: null,
            orgId: null
          }
        })
        .state('helpdesk.org', {
          url: '/org/:id',
          templateUrl: 'modules/squared/helpdesk/helpdesk-org.html',
          controller: 'HelpdeskOrgController',
          controllerAs: 'helpdeskOrgCtrl',
          params: {
            org: null,
            id: null
          }
        })
        .state('helpdesk.cloudberry-device', {
          url: '/cloudberryDevice/:orgId/:id',
          templateUrl: 'modules/squared/helpdesk/helpdesk-cloudberry-device.html',
          controller: 'HelpdeskCloudberryDeviceController',
          controllerAs: 'helpdeskDeviceCtrl',
          params: {
            device: null,
            id: null,
            orgId: null
          }
        })
        .state('helpdesk.huron-device', {
          url: '/huronDevice/:orgId/:id',
          templateUrl: 'modules/squared/helpdesk/helpdesk-huron-device.html',
          controller: 'HelpdeskHuronDeviceController',
          controllerAs: 'helpdeskDeviceCtrl',
          params: {
            device: null,
            id: null,
            orgId: null
          }
        });
    }
  ]);

angular
  .module('Huron')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('cdrsupport', {
          url: '/cdrsupport',
          templateUrl: 'modules/huron/cdrLogs/cdrlogs.tpl.html',
          controller: 'CdrLogsCtrl',
          controllerAs: 'cdr',
          parent: 'main'
        })
        .state('cdr-overview', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controller: 'CdrOverviewCtrl',
              controllerAs: 'cdrpanel',
              templateUrl: 'modules/huron/cdrLogs/cdrOverview/cdrOverview.tpl.html'
            }
          },
          params: {
            cdrData: {},
            call: [],
            uniqueIds: [],
            events: [],
            imported: ''
          },
          data: {
            displayName: 'Advanced CDR Report'
          }
        })
        .state('cdrladderdiagram', {
          parent: 'modalFull',
          views: {
            'modal@': {
              templateUrl: 'modules/huron/cdrLogs/cdrLadderDiagram/cdrLadderDiagram.tpl.html',
              controller: 'CdrLadderDiagramCtrl',
              controllerAs: 'cdrLadderDiagram'
            }
          },
          params: {
            call: [],
            uniqueIds: [],
            events: [],
            imported: ''
          }
        })
        .state('callroutingBase', {
          abstract: true,
          parent: 'main',
          templateUrl: 'modules/huron/callRouting/callRouting.tpl.html'
        })
        .state('callrouting', {
          url: '/callrouting',
          parent: 'callroutingBase',
          views: {
            'header': {
              templateUrl: 'modules/huron/callRouting/callRoutingHeader.tpl.html'
            },
            'nav': {
              templateUrl: 'modules/huron/callRouting/callRoutingNav.tpl.html',
              controller: 'CallRoutingNavCtrl',
              controllerAs: 'nav'
            },
            'main': {
              template: '<div ui-view></div>'
            }
          }
        })
        .state('callpark', {
          url: '/callpark',
          parent: 'callrouting',
          templateUrl: 'modules/huron/callRouting/callPark/callPark.tpl.html',
          controller: 'CallParkCtrl',
          controllerAs: 'cp'
        })
        .state('callpickup', {
          url: '/callpickup',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('intercomgroups', {
          url: '/intercomgroups',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('paginggroups', {
          url: '/paginggroups',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('huntgroups', {
          url: '/huntgroups',
          parent: 'callrouting',
          template: '<div></div>'
        })
        .state('mediaonhold', {
          parent: 'modalLarge',
          url: '/mediaonhold',
          views: {
            'modal@': {
              templateUrl: 'modules/huron/moh/moh.tpl.html',
              controller: 'MohCtrl',
              controllerAs: 'moh'
            }
          }
        })
        .state('trialAdd', {
          abstract: true,
          parent: 'modal',
          views: {
            'modal@': {
              template: '<div ui-view></div>',
              controller: 'TrialAddCtrl',
              controllerAs: 'trial'
            }
          }
        })
        .state('trialAdd.info', {
          templateUrl: 'modules/core/trials/trialAdd.tpl.html'
        })
        .state('trialAdd.finishSetup', {
          templateUrl: 'modules/core/trials/trialFinishSetup.tpl.html',
        })
        .state('trialAdd.meeting', {
          templateUrl: 'modules/core/trials/trialMeeting.tpl.html',
          controller: 'TrialMeetingCtrl',
          controllerAs: 'meetingTrial'
        })
        .state('trialAdd.call', {
          templateUrl: 'modules/core/trials/trialCall.tpl.html',
          controller: 'TrialDeviceController',
          controllerAs: 'callTrial'
        })
        .state('trialAdd.pstn', {
          templateUrl: 'modules/core/trials/trialPstn.tpl.html',
          controller: 'TrialPstnCtrl',
          controllerAs: 'pstnTrial'
        })
        .state('trialAdd.emergAddress', {
          templateUrl: 'modules/core/trials/trialEmergAddress.tpl.html',
          controller: 'TrialEmergAddressCtrl',
          controllerAs: 'eAddressTrial'
        })
        .state('trialAdd.addNumbers', {
          templateUrl: 'modules/core/trials/addNumbers.tpl.html',
          controller: 'DidAddCtrl',
          controllerAs: 'didAdd',
          params: {
            currentTrial: {},
            currentOrg: {},
          }
        })
        .state('trialEdit', {
          abstract: true,
          parent: 'modal',
          views: {
            'modal@': {
              template: '<div ui-view></div>',
              controller: 'TrialEditCtrl',
              controllerAs: 'trial'
            }
          },
          params: {
            currentTrial: {},
            details: {}
          }
        })
        .state('trialEdit.addNumbers', {
          templateUrl: 'modules/core/trials/addNumbers.tpl.html',
          controller: 'DidAddCtrl',
          controllerAs: 'didAdd',
          params: {
            currentOrg: {}
          }
        })
        .state('trialEdit.info', {
          templateUrl: 'modules/core/trials/trialEdit.tpl.html'
        })
        .state('trialEdit.finishSetup', {
          templateUrl: 'modules/core/trials/trialFinishSetup.tpl.html',
        })
        .state('trialEdit.meeting', {
          templateUrl: 'modules/core/trials/trialMeeting.tpl.html',
          controller: 'TrialMeetingCtrl',
          controllerAs: 'meetingTrial'
        })
        .state('trialEdit.call', {
          templateUrl: 'modules/core/trials/trialCall.tpl.html',
          controller: 'TrialDeviceController',
          controllerAs: 'callTrial'
        })
        .state('trialEdit.pstn', {
          templateUrl: 'modules/core/trials/trialPstn.tpl.html',
          controller: 'TrialPstnCtrl',
          controllerAs: 'pstnTrial'
        })
        .state('trialEdit.emergAddress', {
          templateUrl: 'modules/core/trials/trialEmergAddress.tpl.html',
          controller: 'TrialEmergAddressCtrl',
          controllerAs: 'eAddressTrial'
        })
        .state('generateauthcode', {
          parent: 'modal',
          url: '/generateauthcode',
          params: {
            currentUser: {},
            activationCode: {}
          },
          views: {
            'modal@': {
              templateUrl: 'modules/huron/device/generateActivationCodeModal.tpl.html',
              controller: 'GenerateActivationCodeCtrl',
              controllerAs: 'genAuthCode'
            }
          }
        })
        .state('didadd', {
          parent: 'modal',
          params: {
            currentOrg: {},
            editMode: true
          },
          views: {
            'modal@': {
              templateUrl: 'modules/huron/didAdd/didAdd.tpl.html',
              controller: 'DidAddCtrl',
              controllerAs: 'didAdd'
            }
          }
        })
        .state('pstnSetup', {
          parent: 'modalFull',
          params: {
            customerId: {},
            customerName: {},
            customerEmail: {}
          },
          views: {
            'modal@': {
              template: '<div ui-view></div>',
              controller: 'PstnSetupCtrl',
              controllerAs: 'pstnSetup'
            },
            '@pstnSetup': {
              templateUrl: 'modules/huron/pstnSetup/pstnProviders/pstnProviders.tpl.html',
              controller: 'PstnProvidersCtrl',
              controllerAs: 'pstnProviders'
            }
          }
        })
        .state('pstnSetup.contractInfo', {
          templateUrl: 'modules/huron/pstnSetup/pstnContractInfo/pstnContractInfo.tpl.html',
          controller: 'PstnContractInfoCtrl',
          controllerAs: 'pstnContractInfo'
        })
        .state('pstnSetup.serviceAddress', {
          templateUrl: 'modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.tpl.html',
          controller: 'PstnServiceAddressCtrl',
          controllerAs: 'pstnServiceAddress'
        })
        .state('pstnSetup.orderNumbers', {
          templateUrl: 'modules/huron/pstnSetup/pstnNumbers/pstnNumbers.tpl.html',
          controller: 'PstnNumbersCtrl',
          controllerAs: 'pstnNumbers'
        })
        .state('pstnSetup.swivelNumbers', {
          templateUrl: 'modules/huron/pstnSetup/pstnSwivelNumbers/pstnSwivelNumbers.tpl.html',
          controller: 'PstnSwivelNumbersCtrl',
          controllerAs: 'pstnSwivelNumbers'
        })
        .state('pstnSetup.review', {
          templateUrl: 'modules/huron/pstnSetup/pstnReview/pstnReview.tpl.html',
          controller: 'PstnReviewCtrl',
          controllerAs: 'pstnReview'
        })
        .state('pstnSetup.nextSteps', {
          templateUrl: 'modules/huron/pstnSetup/pstnNextSteps/pstnNextSteps.tpl.html',
          controller: 'PstnNextStepsCtrl',
          controllerAs: 'pstnNextSteps'
        })
        .state('hurondetailsBase', {
          abstract: true,
          parent: 'main',
          templateUrl: 'modules/huron/details/huronDetails.tpl.html'
        })
        .state('hurondetails', {
          url: '/hurondetails',
          parent: 'hurondetailsBase',
          views: {
            'header': {
              templateUrl: 'modules/huron/details/huronDetailsHeader.tpl.html',
              controller: 'HuronDetailsHeaderCtrl',
              controllerAs: 'header'
            },
            'main': {
              template: '<div ui-view></div>'
            }
          }
        })
        .state('huronlines', {
          url: '/lines',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/lines/lineList.tpl.html',
          controller: 'LinesListCtrl',
          controllerAs: 'linesListCtrl'
        })
        .state('huronsettings', {
          url: '/settings',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/settings/settings.tpl.html',
          controller: 'HuronSettingsCtrl',
          controllerAs: 'settings'
        })
        .state('huronfeatures', {
          url: '/features',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/features/featureLanding/features.tpl.html',
          controller: 'HuronFeaturesCtrl',
          controllerAs: 'huronFeaturesCtrl'
        })
        .state('huronnewfeature', {
          url: '/newfeature',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/features/newFeature/newFeature.tpl.html',
          controller: 'NewFeatureCtrl',
          controllerAs: 'newFeatureCtrl'
        })
        .state('huronfeatures.aabuilder', {
          parent: 'hurondetails',
          params: {
            aaName: '',
            aaTemplate: ''
          },
          templateUrl: 'modules/huron/features/autoAttendant/builder/aaBuilderMain.tpl.html',
          controller: 'AABuilderMainCtrl',
          controllerAs: 'aaBuilderMain'
        })
        .state('huronfeatures.deleteFeature', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'HuronFeatureDeleteCtrl',
              controllerAs: 'huronFeatureDelete',
              templateUrl: 'modules/huron/features/featureLanding/featureDeleteModal.tpl.html'
            }
          },
          params: {
            deleteFeatureName: null,
            deleteFeatureId: null,
            deleteFeatureType: null
          }
        })
        .state('huronfeatures.aaListDepends', {
          parent: 'modal',
          views: {
            'modal@': {
              controller: 'HuronFeatureAADependsCtrl',
              controllerAs: 'huronFeatureAADepends',
              templateUrl: 'modules/huron/features/featureLanding/featureAADependsModal.tpl.html'
            }
          },
          params: {
            detailsFeatureName: null,
            detailsFeatureId: null,
            detailsFeatureType: null,
            detailsDependsList: null
          }
        })
        .state('huronHuntGroup', {
          url: '/huronHuntGroup',
          parent: 'hurondetails',
          templateUrl: 'modules/huron/features/huntGroup/hgSetupAssistant.tpl.html',
          controller: 'HuntGroupSetupAssistantCtrl',
          controllerAs: 'huntGroupSA'
        })
        .state('huntgroupedit', {
          url: '/features/hg/edit',
          parent: 'main',
          templateUrl: 'modules/huron/features/huntGroup/edit/hgEdit.tpl.html',
          controller: 'HuntGroupEditCtrl',
          controllerAs: 'hge',
          params: {
            feature: null
          }
        });
    }
  ]);

angular
  .module('Hercules')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('calendar-service', {
          templateUrl: 'modules/hercules/expressway-service/overview.html',
          controller: 'ExpresswayServiceController',
          controllerAs: 'exp',
          data: {
            serviceType: "c_cal"
          },
          parent: 'main',
          abstract: true
        })
        .state('calendar-service.list', {
          url: '/services/calendar',
          views: {
            'fullPane': {
              templateUrl: 'modules/hercules/expressway-service/cluster-list.html'
            }
          }
        })
        .state('calendar-service.settings', {
          url: '/services/calendar/settings',
          views: {
            'fullPane': {
              controllerAs: 'expresswayServiceSettings',
              controller: 'ExpresswayServiceSettingsController',
              templateUrl: 'modules/hercules/expressway-service/calendar-service-settings.html'
            }
          },
          params: {
            serviceType: "c_cal"
          }
        })
        .state('call-service', {
          templateUrl: 'modules/hercules/expressway-service/overview.html',
          controller: 'ExpresswayServiceController',
          controllerAs: 'exp',
          data: {
            serviceType: "c_ucmc"
          },
          parent: 'main'
        })
        .state('call-service.list', {
          url: '/services/call',
          views: {
            'fullPane': {
              templateUrl: 'modules/hercules/expressway-service/cluster-list.html'
            }
          }
        })
        .state('call-service.settings', {
          url: '/services/call/settings',
          views: {
            'fullPane': {
              controllerAs: 'expresswayServiceSettings',
              controller: 'ExpresswayServiceSettingsController',
              templateUrl: 'modules/hercules/expressway-service/call-service-settings.html'
            }
          },
          params: {
            serviceType: "c_ucmc"
          }
        })
        .state('management-service', {
          templateUrl: 'modules/hercules/expressway-service/overview.html',
          controller: 'ExpresswayServiceController',
          controllerAs: 'exp',
          data: {
            serviceType: "c_mgmt"
          },
          parent: 'main',
          abstract: true
        })
        .state('management-service.list', {
          url: '/services/expressway-management',
          views: {
            'fullPane': {
              templateUrl: 'modules/hercules/expressway-service/cluster-list.html'
            }
          }
        })
        .state('management-service.settings', {
          url: '/services/expressway-management/settings',
          views: {
            'fullPane': {
              controllerAs: 'expresswayServiceSettings',
              controller: 'ExpresswayServiceSettingsController',
              templateUrl: 'modules/hercules/expressway-service/management-service-settings.html'
            }
          },
          params: {
            serviceType: "c_mgmt"
          }
        })
        .state('cluster-details', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controllerAs: 'clusterDetailsCtrl',
              controller: 'ExpresswayServiceClusterController',
              templateUrl: 'modules/hercules/expressway-service/cluster-details.html'
            },
            'header@cluster-details': {
              templateUrl: 'modules/hercules/expressway-service/cluster-header.html'
            }
          },
          data: {
            displayName: 'Overview'
          },
          params: {
            clusterId: null,
            serviceType: null
          }
        })
        .state('cluster-details.cluster-settings', {
          templateUrl: 'modules/hercules/expressway-service/cluster-settings.html',
          controller: 'ExpresswayClusterSettingsController',
          controllerAs: 'expresswayClusterSettingsCtrl',
          data: {
            displayName: 'Edit'
          },
          params: {
            clusterId: null,
            serviceType: null
          }
        })
        .state('cluster-details.alarm-details', {
          templateUrl: 'modules/hercules/expressway-service/alarm-details.html',
          controller: 'AlarmController',
          controllerAs: 'alarmCtrl',
          data: {
            displayName: 'Alarm Details'
          },
          params: {
            alarm: null,
            host: null
          }
        })
        .state('cluster-details.host-details', {
          templateUrl: 'modules/hercules/expressway-service/host-details.html',
          controller: 'ExpresswayHostDetailsController',
          controllerAs: 'hostDetailsCtrl',
          data: {
            displayName: 'Host'
          },
          params: {
            host: null,
            clusterId: null,
            serviceType: null
          }
        });
    }
  ]);

angular
  .module('Mediafusion')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('meetings', {
          abstract: true,
          template: '<div ui-view></div>',
          //url: '/meetings',
          //templateUrl: 'modules/mediafusion/meetings/meetingList/meetingList.tpl.html',
          //controller: 'ListMeetingsCtrl',
          parent: 'main'
        })
        .state('meetings.list', {
          url: '/meetings',
          templateUrl: 'modules/mediafusion/meetings/meetingList/meetingList.tpl.html',
          controller: 'ListMeetingsCtrl',
          params: {
            showAddUsers: {}
          }
        })
        .state('meetings.list.preview', {
          templateUrl: 'modules/mediafusion/meetings/meetingPreview/meetingPreview.tpl.html',
          controller: 'MeetingPreviewCtrl'
        })
        .state('metrics', {
          url: '/metrics',
          templateUrl: 'modules/mediafusion/metrics/metricsList/metricsList.tpl.html',
          controller: 'MetricsCtrl',
          parent: 'main'
        })
        .state('metrics.preview', {
          templateUrl: 'modules/mediafusion/metrics/metricsPreview/metricsPreview.tpl.html',
          controller: 'MetricsPreviewCtrl'
        })
        .state('threshold', {
          url: '/threshold',
          templateUrl: 'modules/mediafusion/threshold/thresholdList/thresholdList.tpl.html',
          controller: 'ThresholdCtrl',
          parent: 'main'
        })
        .state('threshold.preview', {
          templateUrl: 'modules/mediafusion/threshold/thresholdPreview/thresholdPreview.tpl.html',
          controller: 'ThresholdPreviewCtrl'
        })
        .state('fault', {
          url: '/fault',
          templateUrl: 'modules/mediafusion/faultRules/faultRules.tpl.html',
          controller: 'FaultRulesCtrl',
          parent: 'main'
        })
        .state('vts', {
          abstract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('vts.list', {
          url: '/vts',
          templateUrl: 'modules/mediafusion/enterpriseResource/enterpriseResourceList/enterpriseResourceList.tpl.html',
          controller: 'ListVtsCtrl'
        })
        .state('vts.list.preview', {
          templateUrl: 'modules/mediafusion/enterpriseResource/enterpriseResourcePreview/enterpriseResourcePreview.tpl.html',
          controller: 'VtsPreviewCtrl'
        })
        .state('alarms', {
          url: '/alarms',
          templateUrl: 'modules/mediafusion/alarms/alarmList/alarmList.tpl.html',
          controller: 'AlarmListCtrl',
          parent: 'main'
        })
        .state('alarms.preview', {
          templateUrl: 'modules/mediafusion/alarms/alarmPreview/alarmPreview.tpl.html',
          controller: 'AlarmPreviewCtrl'
        })
        .state('events', {
          url: '/events',
          templateUrl: 'modules/mediafusion/events/eventList/eventList.tpl.html',
          controller: 'EventListCtrl',
          parent: 'main'
        })
        .state('events.preview', {
          templateUrl: 'modules/mediafusion/events/eventPreview/eventPreview.tpl.html',
          controller: 'EventPreviewCtrl'
        })
        .state('utilization', {
          url: '/utilization',
          templateUrl: 'modules/mediafusion/utilization/overAllUtilization.tpl.html',
          controller: 'UtilizationCtrl',
          parent: 'main'
        })
        .state('media-service', {
          templateUrl: 'modules/mediafusion/media-service/overview.html',
          controller: 'MediaServiceController',
          controllerAs: 'med',
          parent: 'main'
        })
        .state('media-service.list', {
          url: '/mediaservice',
          views: {
            'fullPane': {
              templateUrl: 'modules/mediafusion/media-service/resources/cluster-list.html'
            }
          }
        })
        .state('media-service.settings', {
          url: '/mediaservice/settings',
          views: {
            'fullPane': {
              controllerAs: 'mediaServiceSettings',
              controller: 'MediaServiceSettingsController',
              templateUrl: 'modules/mediafusion/media-service/settings/media-service-settings.html'
            }
          }
        })
        .state('connector-details', {
          parent: 'sidepanel',
          views: {
            'sidepanel@': {
              controllerAs: 'groupDetails',
              controller: 'GroupDetailsController',
              templateUrl: 'modules/mediafusion/media-service/side-panel/group-details.html'
            },
            'header@connector-details': {
              templateUrl: 'modules/mediafusion/media-service/side-panel/group-header.html'
            }
          },
          data: {
            displayName: 'Overview'
          },
          params: {
            groupName: {},
            selectedClusters: {}
          }
        })
        .state('connector-details.alarm-details', {
          templateUrl: 'modules/mediafusion/media-service/side-panel/alarm-details.html',
          controller: 'MediaAlarmController',
          controllerAs: 'alarmCtrl',
          data: {
            displayName: 'Alarm Details'
          },
          params: {
            alarm: null,
            host: null
          }
        })
        .state('connector-details.host-details', {
          templateUrl: 'modules/mediafusion/media-service/side-panel/host-details.html',
          controller: 'HostDetailsController',
          controllerAs: 'hostDetails',
          data: {
            displayName: 'Host'
          },
          params: {
            clusterId: null,
            properties: null,
            connector: null,
            hostLength: null
          }
        })
        .state('connector-details.group-settings', {
          templateUrl: 'modules/mediafusion/media-service/side-panel/group-settings.html',
          controller: 'GroupSettingsController',
          controllerAs: 'groupClusterSettingsCtrl',
          data: {
            displayName: 'Settings'
          },
          params: {
            clusterList: null
          }
        });
    }
  ]);

angular
  .module('Messenger')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('messenger', {
          parent: 'main',
          url: '/messenger',
          templateUrl: 'modules/messenger/ci-sync/ciSync.tpl.html',
          controller: 'CiSyncCtrl',
          controllerAs: 'sync'
        });
    }
  ]);
