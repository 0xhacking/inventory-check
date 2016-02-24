'use strict';

angular.module('Core')
  .service('Authinfo', ['$rootScope', '$translate', 'Config', 'Localytics',
    function Authinfo($rootScope, $translate, Config, Localytics) {
      function ServiceFeature(label, value, name, license) {
        this.label = label;
        this.value = value;
        this.name = name;
        this.license = license;
        this.isCustomerPartner = false;
      }

      // AngularJS will instantiate a singleton by calling "new" on this function
      var authData = {
        'username': null,
        'userId': null,
        'orgName': null,
        'orgId': null,
        'addUserEnabled': null,
        'entitleUserEnabled': null,
        'managedOrgs': [],
        'entitlements': null,
        'services': null,
        'roles': [],
        'tabs': [],
        'isInitialized': false,
        'setupDone': false,
        'licenses': [],
        'messageServices': null,
        'conferenceServices': null,
        'communicationServices': null,
        'conferenceServicesWithoutSiteUrl': null,
        'cmrServices': null,
        'hasAccount': false,
        'emails': null
      };

      var getTabTitle = function (title) {
        return $translate.instant(title);
      };

      var isAllowedState = function (state) {
        if (!state) {
          return false;
        }

        var roles = authData.roles;
        var services = authData.services || [];
        var view = (_.includes(roles, 'PARTNER_ADMIN') || _.includes(roles, 'PARTNER_USER')) ? 'partner' : 'customer';

        // check if the state is part of the restricted list for this view
        if (_.includes(Config.restrictedStates[view], state)) {
          return false;
        }

        var parentState = state.split('.')[0];
        // if the state is in the allowed list, all good
        if (_.includes(Config.publicStates, parentState)) {
          return true;
        }

        // if state for Cisco only AND user in one of Cisco's organisation
        if (_.includes(Config.ciscoOnly, parentState) && (authData.orgId === Config.ciscoOrgId || authData.orgId === Config.ciscoMockOrgId)) {
          return true;
        }

        // if the state is in the allowed list of one or the user's role, all good
        var stateAllowedByARole = _.some(roles, function (role) {
          return _.chain(Config.roleStates)
            .get(role)
            .includes(parentState)
            .value();
        });
        if (stateAllowedByARole) {
          return true;
        }

        // if the state is in the allowed list of one or the user's service, all good
        var stateAllowedByAService = _.some(services, function (service) {
          return _.chain(Config.serviceStates)
            .get(service.ciName)
            .includes(parentState)
            .value();
        });
        if (stateAllowedByAService) {
          return true;
        }

        return false;
      };

      //update the tabs when Authinfo data has been populated.
      var initializeTabs = function () {
        var tabs = angular.copy(Config.tabs);
        // Remove states out of tab structure that are not allowed or had all their subPages removed
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i] && tabs[i].subPages) {
            for (var j = 0; j < tabs[i].subPages.length; j++) {
              if (tabs[i].subPages[j] && !isAllowedState(tabs[i].subPages[j].state)) {
                tabs[i].subPages.splice(j--, 1);
              }
            }
            if (tabs[i].subPages.length === 0) {
              tabs.splice(i--, 1);
            }
          } else if (tabs[i] && !isAllowedState(tabs[i].state)) {
            tabs.splice(i--, 1);
          }
        }
        //Localize tabs
        for (var index in tabs) {
          tabs[index].title = getTabTitle(tabs[index].title);
          if (tabs[index].subPages) {
            for (var k in tabs[index].subPages) {
              tabs[index].subPages[k].title = $translate.instant(tabs[index].subPages[k].title);
              tabs[index].subPages[k].desc = $translate.instant(tabs[index].subPages[k].desc);
            }
          }
        }
        return tabs;
      };

      var isEntitled = function (entitlement) {
        var services = authData.services;
        if (services) {
          for (var i = 0; i < services.length; i++) {
            var service = services[i];
            if (service && service.ciName === entitlement) {
              return true;
            }
          }
        }
        return false;
      };

      return {
        initialize: function (data) {
          authData.isInDelegatedAdministrationOrg = data.isInDelegatedAdministrationOrg;
          authData.username = data.name;
          authData.orgName = data.orgName;
          authData.orgId = data.orgId;
          authData.addUserEnabled = data.addUserEnabled;
          authData.entitleUserEnabled = data.entitleUserEnabled;
          authData.managedOrgs = data.managedOrgs;
          authData.entitlements = data.entitlements;
          authData.services = data.services;
          authData.roles = data.roles; // ["Helpdesk"];
          //if Full_Admin or WX2_User and has managedOrgs, add partnerustomers tab as allowed tab
          if (authData.managedOrgs && authData.managedOrgs.length > 0) {
            for (var i = 0; i < authData.roles.length; i++) {
              if (authData.roles[i] === 'Full_Admin' || authData.roles[i] === 'User') {
                this.isCustomerPartner = true;
                authData.roles.push('CUSTOMER_PARTNER');
                break;
              }
            }
          }

          // TODO remove this from rootScope
          $rootScope.services = data.services;
          authData.isInitialized = true;
          authData.setupDone = data.setupDone;
          $rootScope.$broadcast('AuthinfoUpdated');
          //org id of user
          Localytics.customDimension(1, authData.orgName);
        },
        initializeTabs: function () {
          authData.tabs = initializeTabs();
        },
        clear: function () {
          authData.username = null;
          authData.userId = null;
          authData.orgName = null;
          authData.orgId = null;
          authData.addUserEnabled = null;
          authData.entitleUserEnabled = null;
          authData.entitlements = null;
          authData.services = null;
          authData.tabs = [];
          authData.roles = [];
          authData.isInitialized = false;
          authData.setupDone = null;
          authData.emails = null;
        },
        setEmails: function (data) {
          authData.emails = data;
          var msg = this.getPrimaryEmail() || 'No primary email exists for this user';
          Localytics.customDimension(0, msg);
        },
        getEmails: function () {
          return authData.emails;
        },
        getPrimaryEmail: function () {
          for (var emails in authData.emails) {
            if (authData.emails[emails].primary === true) {
              return authData.emails[emails].value;
            }
            return null;
          }
        },
        updateAccountInfo: function (data) {
          if (data) {
            var msgLicenses = [];
            var confLicenses = [];
            var commLicenses = [];
            var cmrLicenses = [];
            var confLicensesWithoutSiteUrl = [];
            var accounts = data.accounts || [];

            if (accounts.length > 0) {
              authData.hasAccount = true;
            }

            for (var x = 0; x < accounts.length; x++) {

              var account = accounts[x];

              for (var l = 0; l < account.licenses.length; l++) {
                var license = account.licenses[l];
                var service = null;

                // Store license before filtering
                authData.licenses.push(license);

                // Do not store invalid licenses in service buckets
                if (license.status === 'CANCELLED' || license.status === 'SUSPENDED') {
                  continue;
                }

                switch (license.licenseType) {
                case 'CONFERENCING':
                  if (this.isCustomerAdmin() && license.siteUrl) {
                    authData.roles.push('Site_Admin');
                  }

                  service = new ServiceFeature($translate.instant(Config.confMap[license.offerName], {
                    capacity: license.capacity
                  }), x + 1, 'confRadio', license);
                  if (license.siteUrl) {
                    confLicensesWithoutSiteUrl.push(service);
                  }
                  confLicenses.push(service);
                  break;
                case 'MESSAGING':
                  service = new ServiceFeature($translate.instant('onboardModal.paidMsg'), x + 1, 'msgRadio', license);
                  msgLicenses.push(service);
                  break;
                case 'COMMUNICATION':
                  service = new ServiceFeature($translate.instant('onboardModal.paidComm'), x + 1, 'commRadio', license);
                  commLicenses.push(service);
                  break;
                case 'CMR':
                  service = new ServiceFeature($translate.instant('onboardModal.cmr'), x + 1, 'cmrRadio', license);
                  cmrLicenses.push(service);
                }
              } //end for
            } //end for
            if (msgLicenses.length !== 0) {
              authData.messageServices = msgLicenses;
            }
            if (confLicenses.length !== 0) {
              authData.conferenceServices = confLicenses;
            }
            if (commLicenses.length !== 0) {
              authData.communicationServices = commLicenses;
            }
            if (cmrLicenses.length !== 0) {
              authData.cmrServices = cmrLicenses;
            }
            if (confLicensesWithoutSiteUrl.length !== 0) {
              authData.conferenceServicesWithoutSiteUrl = confLicensesWithoutSiteUrl;
            }
            $rootScope.$broadcast('AccountinfoUpdated');
          } //end if
        },
        getOrgName: function () {
          return authData.orgName;
        },
        getOrgId: function () {
          return authData.orgId;
        },
        getUserName: function () {
          return authData.username;
        },
        setUserId: function (id) {
          authData.userId = id;
        },
        getUserId: function () {
          return authData.userId;
        },
        getUserEntitlements: function () {
          return authData.entitlements;
        },
        isAddUserEnabled: function () {
          return authData.addUserEnabled;
        },
        isEntitleUserEnabled: function () {
          return authData.entitleUserEnabled;
        },
        getServices: function () {
          return authData.services;
        },
        getManagedOrgs: function () {
          return authData.managedOrgs;
        },
        getLicenses: function () {
          return authData.licenses;
        },
        getMessageServices: function () {
          return authData.messageServices;
        },
        getConferenceServices: function () {
          return authData.conferenceServices;
        },
        getCommunicationServices: function () {
          return authData.communicationServices;
        },
        getCmrServices: function () {
          return authData.cmrServices;
        },
        getConferenceServicesWithoutSiteUrl: function () {
          return authData.conferenceServicesWithoutSiteUrl;
        },
        getRoles: function () {
          return authData.roles;
        },
        hasRole: function (role) {
          var roles = this.getRoles();
          return !!(roles && roles.length && (roles.indexOf(role) > -1));
        },
        isSetupDone: function () {
          return authData.setupDone;
        },
        setSetupDone: function (setupDone) {
          authData.setupDone = setupDone;
        },
        getTabs: function () {
          return authData.tabs;
        },
        isAllowedState: function (state) {
          return isAllowedState(state);
        },
        isInitialized: function () {
          return authData.isInitialized;
        },
        isAppAdmin: function () {
          return this.hasRole('Application');
        },
        isAdmin: function () {
          return this.hasRole('Full_Admin') || this.hasRole('PARTNER_ADMIN');
        },
        isReadOnlyAdmin: function () {
          return this.hasRole('Readonly_Admin') && !this.isAdmin();
        },
        isCustomerAdmin: function () {
          return this.hasRole('Full_Admin');
        },
        isPartner: function () {
          return this.hasRole('PARTNER_USER') || this.hasRole('PARTNER_ADMIN');
        },
        isPartnerAdmin: function () {
          return this.hasRole('PARTNER_ADMIN');
        },
        isPartnerSalesAdmin: function () {
          return this.hasRole('PARTNER_SALES_ADMIN');
        },
        isPartnerUser: function () {
          return this.hasRole('PARTNER_USER');
        },
        isSquaredTeamMember: function () {
          return this.hasRole('WX2_User');
        },
        isSquaredInviter: function () {
          return this.hasRole('WX2_SquaredInviter');
        },
        isSupportUser: function () {
          return this.hasRole('Support') && !this.isAdmin();
        },
        isHelpDeskUser: function () {
          return this.hasRole(Config.roles.helpdesk);
        },
        isHelpDeskUserOnly: function () {
          var roles = this.getRoles();
          if (roles && this.isHelpDeskUser()) {
            return _.all(roles, function (role) {
              return role == Config.roles.helpdesk || role == 'PARTNER_USER' || role == 'User';
            });
          }
          return false;
        },
        isServiceAllowed: function (service) {
          if (service === 'squaredTeamMember' && !this.isSquaredTeamMember()) {
            return false;
          } else {
            return true;
          }
        },
        isSquaredUC: function () {
          return isEntitled(Config.entitlements.huron);
        },
        isFusion: function () {
          return isEntitled(Config.entitlements.fusion_mgmt);
        },
        isFusionUC: function () {
          return isEntitled(Config.entitlements.fusion_uc);
        },
        isFusionCal: function () {
          return isEntitled(Config.entitlements.fusion_cal);
        },
        isDeviceMgmt: function () {
          return isEntitled(Config.entitlements.room_system);
        },
        isFusionEC: function () {
          return isEntitled(Config.entitlements.fusion_ec);
        },
        hasAccount: function () {
          return authData.hasAccount;
        },
        isCisco: function () {
          return this.getOrgId() === Config.ciscoOrgId;
        },
        isCiscoMock: function () {
          return this.getOrgId() === Config.ciscoMockOrgId;
        },
        isEntitled: function (entitlement) {
          return isEntitled(entitlement);
        },
        isUserAdmin: function () {
          return this.getRoles().indexOf('Full_Admin') > -1;
        },
        isInDelegatedAdministrationOrg: function () {
          return authData.isInDelegatedAdministrationOrg;
        },
        getLicenseIsTrial: function (licenseType, entitlement) {
          var isTrial = _.chain(authData.licenses)
            .reduce(function (isTrial, license) {
              if (entitlement) {
                return license.licenseType === licenseType && _.includes(license.features, entitlement) ? license.isTrial : isTrial;
              }
              return license.licenseType === licenseType ? license.isTrial : isTrial;
            }, undefined)
            .value();

          return isTrial;
        }
      };
    }
  ]);
