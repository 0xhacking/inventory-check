'use strict';

//TODO refactor this into OnboardCtrl, BulkUserCtrl, AssignServicesCtrl
angular.module('Core')
  .controller('OnboardCtrl', ['$scope', '$state', '$stateParams', '$q', '$http', '$window', 'Log', 'Authinfo', '$rootScope', '$translate', 'LogMetricsService', 'Config', 'GroupService', 'Notification', 'Userservice', '$timeout', 'Utils', 'Orgservice', 'TelephonyInfoService', 'FeatureToggleService', 'NAME_DELIMITER', 'SyncService', 'TelephoneNumberService', 'DialPlanService', 'CsvDownloadService',
    function ($scope, $state, $stateParams, $q, $http, $window, Log, Authinfo, $rootScope, $translate, LogMetricsService, Config, GroupService, Notification, Userservice, $timeout, Utils, Orgservice, TelephonyInfoService, FeatureToggleService, NAME_DELIMITER, SyncService, TelephoneNumberService, DialPlanService, CsvDownloadService) {
      $scope.hasAccount = Authinfo.hasAccount();
      $scope.usrlist = [];
      $scope.internalNumberPool = [];
      $scope.externalNumberPool = [];
      $scope.isMsgrSyncEnabled = false;
      $scope.telephonyInfo = {};

      $scope.getMessengerSyncStatus = getMessengerSyncStatus;
      $scope.loadInternalNumberPool = loadInternalNumberPool;
      $scope.loadExternalNumberPool = loadExternalNumberPool;
      $scope.checkDnOverlapsSteeringDigit = checkDnOverlapsSteeringDigit;
      $scope.assignDNForUserList = assignDNForUserList;
      $scope.assignMapUserList = assignMapUserList;
      $scope.checkDidDnDupes = checkDidDnDupes;
      $scope.returnInternalNumberlist = returnInternalNumberlist;
      $scope.mapDidToDn = mapDidToDn;
      $scope.resetDns = resetDns;
      $scope.syncGridDidDn = syncGridDidDn;
      $scope.isMapped = false;
      $scope.isMapInProgress = false;
      $scope.isResetInProgress = false;
      $scope.isMapEnabled = true;
      $scope.processing = false;
      $scope.PATTERN_LIMIT = 50;
      $scope.dirSyncConnectorDownload = "https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/CloudConnectorManager/DirectoryConnector.zip";

      $scope.isReset = false;
      $scope.showExtensions = true;
      $scope.isResetEnabled = false;

      // model can be removed after switching to controllerAs
      $scope.model = {
        userInputOption: 0,
        uploadProgress: 0
      };

      $scope.strFirstName = $translate.instant('usersPage.firstNamePlaceHolder');
      $scope.strLastName = $translate.instant('usersPage.lastNamePlaceHolder');
      $scope.strEmailAddress = $translate.instant('usersPage.emailAddressPlaceHolder');
      var strNameAndEmailAdress = $translate.instant('usersPage.nameAndEmailAddress');
      $scope.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
      $scope.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
      $scope.userInputOptions = [{
        label: $scope.strEmailAddress,
        value: 0,
        name: 'radioOption',
        id: 'radioEmail'
      }, {
        label: strNameAndEmailAdress,
        value: 1,
        name: 'radioOption',
        id: 'radioNamesAndEmail'
      }];

      /****************************** Did to Dn Mapping START *******************************/
      //***
      //***
      //***********************************************************************************/

      function activateDID() {
        $q.all([loadInternalNumberPool(), loadExternalNumberPool(), toggleShowExtensions(), loadPrimarySiteInfo()])
          .finally(function () {
            if ($scope.showExtensions === true) {
              assignDNForUserList();
              $scope.validateDnForUser();
            } else {
              mapDidToDn();
            }
            $scope.processing = false;
          });
      }

      function loadPrimarySiteInfo() {
        return TelephonyInfoService.getPrimarySiteInfo().then(function (telephonyInfo) {
          $scope.telephonyInfo = telephonyInfo;
        }).catch(function (response) {
          Notification.errorResponse(response, 'directoryNumberPanel.siteError');
        });
      }

      // Check to see if the currently selected directory number's first digit is
      // the same as the company steering digit.
      function checkDnOverlapsSteeringDigit(userEntity) {
        var dnFirstCharacter = "";
        var steeringDigit = $scope.telephonyInfo.steeringDigit;
        return _.startsWith(_.get(userEntity, 'assignedDn.pattern'), steeringDigit);
      }

      function returnInternalNumberlist(pattern) {
        if (pattern) {
          loadInternalNumberPool(pattern);
        } else {
          return $scope.internalNumberPool;
        }
      }

      function loadInternalNumberPool(pattern) {
        return TelephonyInfoService.loadInternalNumberPool(pattern, $scope.PATTERN_LIMIT).then(function (internalNumberPool) {
          $scope.internalNumberPool = internalNumberPool;
        }).catch(function (response) {
          $scope.internalNumberPool = [];
          Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
        });
      }

      function loadExternalNumberPool(pattern) {
        return TelephonyInfoService.loadExternalNumberPool(pattern).then(function (externalNumberPool) {
          $scope.externalNumberPool = externalNumberPool;
        }).catch(function (response) {
          $scope.externalNumberPool = [{
            uuid: 'none',
            pattern: $translate.instant('directoryNumberPanel.none')
          }];
          Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
        });
      }

      function mapDidToDn() {
        $scope.isMapInProgress = true;
        $scope.isMapEnabled = false;
        var count = $scope.usrlist.length;
        TelephonyInfoService.loadExtPoolWithMapping(count).then(function (externalNumberMapping) {
          $scope.externalNumberMapping = externalNumberMapping;
          assignMapUserList(count, externalNumberMapping);
          $scope.isMapped = true;
          $scope.isMapInProgress = false;
          $scope.validateDnForUser();
        }).catch(function (response) {
          $scope.isMapInProgress = false;
          $scope.isMapped = false;
          $scope.isMapEnabled = true;
          $scope.externalNumberMapping = [];
          Notification.errorResponse(response, 'directoryNumberPanel.externalNumberMappingError');
        });
      }

      function assignDNForUserList() {
        angular.forEach($scope.usrlist, function (user, index) {
          user.assignedDn = $scope.internalNumberPool[index];
        });

        // don't select any DID on loading the page
        angular.forEach($scope.usrlist, function (user, index) {
          user.externalNumber = $scope.externalNumberPool[0];
          user.didDnMapMsg = undefined;
        });
      }

      function resetDns() {
        $scope.isResetInProgress = true;
        $scope.isResetEnabled = false;
        loadInternalNumberPool().then(function () {
          assignDNForUserList();
          $scope.validateDnForUser();
          $scope.isReset = true;
          $scope.isResetInProgress = false;
        }).catch(function (response) {
          $scope.isResetInProgress = false;
          $scope.validateDnForUser();
        });
      }

      function assignMapUserList(count, externalNumberMappings) {

        for (var i = 0; i < $scope.usrlist.length; i++) {
          if (i <= externalNumberMappings.length - 1) {
            if (externalNumberMappings[i].directoryNumber !== null) {
              $scope.usrlist[i].externalNumber = externalNumberMappings[i];
              $scope.usrlist[i].assignedDn = externalNumberMappings[i].directoryNumber;
            } else {
              $scope.usrlist[i].externalNumber = externalNumberMappings[i];
              $scope.usrlist[i].didDnMapMsg = 'usersPage.noExtMappingAvail';
            }
          } else {
            $scope.usrlist[i].externalNumber = $scope.externalNumberPool[0];
            $scope.usrlist[i].didDnMapMsg = 'usersPage.noExternalNumberAvail';
          }
        }

      }

      function checkDidDnDupes() {
        var didDnDupe = {
          didDupe: false,
          dnDupe: false
        };
        for (var i = 0; i < $scope.usrlist.length - 1; i++) {
          for (var j = i + 1; j < $scope.usrlist.length; j++) {
            if (angular.isDefined($scope.usrlist[i].assignedDn) && angular.isDefined($scope.usrlist[j].assignedDn) && ($scope.usrlist[i].assignedDn.pattern !== "None") && ($scope.usrlist[i].assignedDn.pattern === $scope.usrlist[j].assignedDn.pattern)) {
              didDnDupe.dnDupe = true;
            }
            if (angular.isDefined($scope.usrlist[i].externalNumber) && angular.isDefined($scope.usrlist[j].externalNumber) && ($scope.usrlist[i].externalNumber.pattern !== "None") && ($scope.usrlist[i].externalNumber.pattern === $scope.usrlist[j].externalNumber.pattern)) {
              didDnDupe.didDupe = true;
            }
            if (didDnDupe.dnDupe && didDnDupe.didDupe) {
              break;
            }
          }
          if (didDnDupe.dnDupe && didDnDupe.didDupe) {
            break;
          }
        }
        return didDnDupe;
      }

      $scope.isDnNotAvailable = function () {
        for (var i = 0; i < $scope.usrlist.length; i++) {
          if ($scope.usrlist[i].assignedDn === undefined) {
            return true;
          }
        }
        return false;
      };

      $scope.assignServicesSave = function () {
        if ($scope.radioStates.commRadio || $scope.entitlements.ciscoUC) {
          $scope.processing = true;
          activateDID();
          $state.go('users.add.services.dn');
        } else {
          onboardUsers(true);
        }
      };

      function toggleShowExtensions() {
        return DialPlanService.getCustomerDialPlanDetails().then(function (response) {
          var indexOfDidColumn = _.findIndex($scope.addDnGridOptions.columnDefs, {
            field: 'externalNumber'
          });
          var indexOfDnColumn = _.findIndex($scope.addDnGridOptions.columnDefs, {
            field: 'internalExtension'
          });
          if (response.extensionGenerated === "true") {
            $scope.showExtensions = false;
            $scope.addDnGridOptions.columnDefs[indexOfDidColumn].visible = false;
            $scope.addDnGridOptions.columnDefs[indexOfDnColumn].displayName = $translate.instant('usersPage.directLineHeader');
          } else {
            $scope.showExtensions = true;
            $scope.addDnGridOptions.columnDefs[indexOfDidColumn].visible = true;
            $scope.addDnGridOptions.columnDefs[indexOfDnColumn].displayName = $translate.instant('usersPage.extensionHeader');
          }
        }).catch(function (response) {
          Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
        });
      }

      // Synchronize the DIDs and DNs on the Assign Numbers page when selections change
      function syncGridDidDn(rowEntity, modifiedFieldName) {
        if ($scope.showExtensions === false) {
          var dnLength = rowEntity.assignedDn.pattern.length;
          // if the internalNumber was changed, find a matching DID and set the externalNumber to match
          if (modifiedFieldName === "internalNumber") {
            var matchingDid = _.find($scope.externalNumberPool, function (extNum) {
              return extNum.pattern.substr(-dnLength) === rowEntity.assignedDn.pattern;
            });
            if (matchingDid) {
              rowEntity.externalNumber = matchingDid;
            }
          }
          // if the externalNumber was changed, find a matching DN and set the internalNumber to match
          if (modifiedFieldName === "externalNumber") {
            var matchingDn = _.find($scope.internalNumberPool, {
              pattern: rowEntity.externalNumber.pattern.substr(-dnLength)
            });
            if (matchingDn) {
              rowEntity.assignedDn = matchingDn;
            }
          }
        }
      }

      /****************************** Did to Dn Mapping END *******************************/
      //***
      //***
      //***********************************************************************************/

      function clearNameAndEmailFields() {
        $scope.model.firstName = '';
        $scope.model.lastName = '';
        $scope.model.emailAddress = '';
        $scope.model.userInfoValid = false;
      }

      function getMessengerSyncStatus() {
        SyncService.isMessengerSyncEnabled()
          .then(function (isIt) {
            $scope.isMsgrSyncEnabled = isIt;
          }, function (errorMsg) {
            Log.error(errorMsg);
          });
      }

      function ServiceFeature(label, value, name, license) {
        this.label = label;
        this.value = value;
        this.name = name;
        this.license = license;
      }

      function FakeLicense(type) {
        this.licenseType = type;
        this.features = Config.getDefaultEntitlements();
      }

      $scope.ConfirmAdditionalServiceSetup = function () {
        var promise = (Notification.confirmation($translate.instant('usersPage.addtionalServiceSetupConfirmation')));
        promise.then(function () {
          $state.go('firsttimewizard');
        });
      };

      $scope.disableCommFeatureAssignment = function () {
        // disable the communication feature assignment unless the UserAdd is part of the First Time Setup Wizard work flow
        return (!Authinfo.isSetupDone() && ((typeof $state.current.data === 'undefined') || (!$state.current.data.firstTimeSetup)));
      };

      var userEnts = null;
      var userLicenseIds = null;
      $scope.cmrFeature = null;
      $scope.messageFeatures = [];
      $scope.conferenceFeatures = [];
      $scope.communicationFeatures = [];
      $scope.licenses = [];
      $scope.populateConf = populateConf;
      $scope.oneBilling = false;
      $scope.selectedSubscription = '';
      $scope.subscriptionOptions = [];
      var convertSuccess = [];
      var convertFailures = [];
      var convertUsersCount = 0;
      var convertStartTime = 0;
      var convertCancelled = false;
      var convertBacked = false;
      var convertPending = false;

      $scope.messageFeatures.push(new ServiceFeature($translate.instant('onboardModal.msgFree'), 0, 'msgRadio', new FakeLicense('freeTeamRoom')));
      $scope.conferenceFeatures.push(new ServiceFeature($translate.instant('onboardModal.mtgFree'), 0, 'confRadio', new FakeLicense('freeConferencing')));
      $scope.communicationFeatures.push(new ServiceFeature($translate.instant('onboardModal.callFree'), 0, 'commRadio', new FakeLicense('advancedCommunication')));
      $scope.currentUser = $stateParams.currentUser;

      if ($scope.currentUser) {
        userEnts = $scope.currentUser.entitlements;
        userLicenseIds = $scope.currentUser.licenseID;
      }

      if (null !== Authinfo.getOrgId()) {
        getMessengerSyncStatus();
      }

      var getSubscriptions = function () {
        if (Authinfo.hasAccount()) {
          Orgservice.getLicensesUsage().then(function (subscriptions) {
            $scope.subscriptionOptions = _.uniq(_.pluck(subscriptions, 'subscriptionId'));
            $scope.selectedSubscription = _.first($scope.subscriptionOptions);
            $scope.oneBilling = _.size($scope.subscriptionOptions) === 1;
          }).catch(function (response) {
            Notification.errorResponse(response, 'onboardModal.subscriptionIdError');
          });
        }
      };

      $scope.modelChange = function () {
        $scope.selectedSubscription = this.selectedSubscription;
      };

      $scope.showMultiSubscriptions = function (billingServiceId, isTrial) {
        var isSelected = false;
        var isTrialSubscription = (_.isUndefined(billingServiceId) || _.isEmpty(billingServiceId)) && isTrial;
        if (_.isArray(billingServiceId)) {
          for (var i in billingServiceId) {
            if (_.eq(billingServiceId[i], $scope.selectedSubscription)) {
              isSelected = true;
              break;
            }
          }
        } else {
          isSelected = _.eq(billingServiceId, $scope.selectedSubscription);
        }

        return $scope.oneBilling || isSelected || isTrialSubscription;
      };

      function populateConf() {
        if (userLicenseIds) {

          _.forEach(userLicenseIds, function (userLicenseId) {
            _.forEach($scope.allLicenses, function (siteObj) {
              if (siteObj.siteUrl === '' && !siteObj.confModel) {
                siteObj.confModel = siteObj.licenseId === userLicenseId;
              }
              siteObj.confLic = _.map(siteObj.confLic, function (conf) {
                if (!conf.confModel) {
                  conf.confModel = conf.licenseId === userLicenseId;
                }
                return conf;
              });
              siteObj.cmrLic = _.map(siteObj.cmrLic, function (cmr) {
                if (!cmr.cmrModel) {
                  cmr.cmrModel = cmr.licenseId === userLicenseId;
                }
                return cmr;
              });
            });
          });
        }
      }

      $scope.radioStates = {
        commRadio: false,
        confRadio: false,
        msgRadio: false,
        subLicense: {}
      };

      if (userEnts) {
        for (var x = 0; x < userEnts.length; x++) {
          if (userEnts[x] === 'ciscouc') {
            $scope.radioStates.commRadio = true;
          } else if (userEnts[x] === 'squared-room-moderation') {
            $scope.radioStates.msgRadio = true;
          }
        }
      }

      function createFeatures(obj) {
        return {
          siteUrl: _.get(obj, 'license.siteUrl', ''),
          billing: _.get(obj, 'license.billingServiceId', ''),
          volume: _.get(obj, 'license.volume', ''),
          licenseId: _.get(obj, 'license.licenseId', ''),
          offerName: _.get(obj, 'license.offerName', ''),
          label: obj.label,
          isTrial: _.get(obj, 'license.isTrial', false),
          confModel: false,
          cmrModel: false
        };
      }

      var generateConfChk = function (confs, cmrs) {
        $scope.confChk = [];
        $scope.allLicenses = [];

        for (var i in confs) {
          var temp = {
            confFeature: confs[i],
            confModel: false,
            confId: 'conf-' + i
          };

          var confNoUrl = _.chain(confs).filter(function (conf) {
            return conf.license.licenseType !== 'freeConferencing';
          }).filter(function (conf) {
            return !_.has(conf, 'license.siteUrl');
          }).map(createFeatures).remove(undefined).value();

          var confFeatures = _.chain(confs).filter('license.siteUrl')
            .map(createFeatures).remove(undefined).value();
          var cmrFeatures = _.chain(cmrs).filter('license.siteUrl')
            .map(createFeatures).remove(undefined).value();

          var siteUrls = _.map(confFeatures, function (lic) {
            return lic.siteUrl;
          });
          siteUrls = _.uniq(siteUrls);

          $scope.allLicenses = _.map(siteUrls, function (site) {
            var confMatches = _.filter(confFeatures, {
              siteUrl: site
            });
            var cmrMatches = _.filter(cmrFeatures, {
              siteUrl: site
            });
            return {
              site: site,
              billing: _.uniq(_.pluck(cmrMatches, 'billing').concat(_.pluck(confMatches, 'billing'))),
              confLic: confMatches,
              cmrLic: cmrMatches
            };
          });
          $scope.allLicenses = _.union(confNoUrl, $scope.allLicenses);

          for (var j in cmrs) {
            if (!_.isUndefined(cmrs[j]) && !_.isNull(cmrs[j]) && !_.isUndefined(confs[i].license.siteUrl)) {
              if (_.isEqual(confs[i].license.siteUrl, cmrs[j].license.siteUrl) && _.isEqual(confs[i].license.billingServiceId, cmrs[j].license.billingServiceId)) {
                temp.cmrFeature = cmrs[j];
                temp.cmrModel = false;
                temp.cmrId = 'cmr-' + j;
              }
            }
          }

          $scope.confChk.push(temp);
        }

        populateConf();
      };

      $scope.isSubscribeable = function (license) {
        if (license.status === 'ACTIVE' || license.status === 'PENDING') {
          return (license.volume > 0);
        }
        return false;
      };

      // [Services] -> [Services] (merges Service[s] w/ same license)
      var mergeMultipleLicenseSubscriptions = function (fetched) {

        // Construct a mapping from License to (array of) Service object(s)
        var services = fetched.reduce(function (object, service) {
          var key = service.license.licenseType;
          if (key in object) {
            object[key].push(service);
          } else {
            object[key] = [service];
          }
          return object;
        }, {});

        // Merge all services with the same License into a single Service
        return _.values(services).map(function (array) {
          var result = {
            licenses: []
          };
          array.forEach(function (service) {
            var copy = angular.copy(service);
            copy.licenses = [copy.license];
            delete copy.license;
            _.merge(result, copy, function (left, right) {
              if (_.isArray(left)) return left.concat(right);
            });
          });
          return result;
        });

      };

      var getAccountServices = function () {
        var services = {
          message: Authinfo.getMessageServices(),
          conference: Authinfo.getConferenceServices(),
          communication: Authinfo.getCommunicationServices()
        };
        if (services.message) {
          services.message = mergeMultipleLicenseSubscriptions(services.message);
          $scope.messageFeatures = $scope.messageFeatures.concat(services.message);
        }
        if (services.conference) {
          $scope.cmrFeatures = Authinfo.getCmrServices();
          $scope.conferenceFeatures = $scope.conferenceFeatures.concat(services.conference);
          generateConfChk($scope.conferenceFeatures, $scope.cmrFeatures);
        }
        if (services.communication) {
          $scope.communicationFeatures = $scope.communicationFeatures.concat(services.communication);
        }
      };

      if (Authinfo.isInitialized()) {
        getAccountServices();
        getSubscriptions();
      }

      GroupService.getGroupList(function (data, status) {
        if (data.success) {
          $scope.groups = data.groups || [];
          if ($scope.groups && $scope.groups.length === 0) {
            var defaultGroup = {
              displayName: 'Default License Group'
            };
            $scope.groups.push(defaultGroup);
          }
          $scope.selectedGroup = $scope.groups[0];
        } else {
          Log.debug('Failed to retrieve group list. Status: ' + status);
          Notification.notify([$translate.instant('onboardModal.apiError', {
            status: status
          })], 'error');
        }
      });

      $scope.collabRadio1 = {
        label: $translate.instant('onboardModal.enableCollab'),
        value: 1,
        name: 'collabRadio',
        id: 'collabRadio1'
      };

      $scope.collabRadio2 = {
        label: $translate.instant('onboardModal.enableCollabGroup'),
        value: 2,
        name: 'collabRadio',
        id: 'collabRadio2'
      };

      $scope.tableOptions = {
        cursorcolor: Config.chartColors.gray,
        cursorminheight: 50,
        cursorborder: "0px",
        cursorwidth: "7px",
        railpadding: {
          top: 0,
          right: 3,
          left: 0,
          bottom: 0
        },
        autohidemode: "leave"
      };

      angular.element('.wizard-main-wrapper').bind('resize', function () {
        var nice = $('#errorTable').getNiceScroll();
        if (nice !== null && nice !== undefined) {
          nice.resize();
        }
      });

      var nameTemplate = '<div class="ui-grid-cell-contents"><span class="name-display-style">{{row.entity.name}}</span>' +
        '<span class="email-display-style">{{row.entity.address}}</span></div>';

      var internalExtensionTemplate = '<div ng-show="row.entity.assignedDn !== undefined"> ' +
        '<cs-select name="internalNumber" ' +
        'ng-model="row.entity.assignedDn" options="grid.appScope.internalNumberPool" ' +
        'refresh-data-fn="grid.appScope.returnInternalNumberlist(filter)" wait-time="0" ' +
        'placeholder="placeholder" input-placeholder="inputPlaceholder" ' +
        'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'internalNumber\')"' +
        'labelfield="pattern" valuefield="uuid" required="true" filter="true"' +
        ' is-warn="{{grid.appScope.checkDnOverlapsSteeringDigit(row.entity)}}" warn-msg="{{\'usersPage.steeringDigitOverlapWarning\' | translate: { steeringDigitInTranslation: telephonyInfo.steeringDigit } }}" > </cs-select></div>' +
        '<div ng-show="row.entity.assignedDn === undefined"> ' +
        '<cs-select name="noInternalNumber" ' +
        'ng-model="grid.appScope.noExtInPool" labelfield="grid.appScope.noExtInPool" is-disabled="true" > </cs-select>' +
        '<span class="error">{{\'usersPage.noExtensionInPool\' | translate }}</span> </div> ';

      var externalExtensionTemplate = '<div ng-show="row.entity.didDnMapMsg === undefined"> ' +
        '<cs-select name="externalNumber" ' +
        'ng-model="row.entity.externalNumber" options="grid.appScope.externalNumberPool" ' +
        'refresh-data-fn="grid.appScope.loadExternalNumberPool(filter)" wait-time="0" ' +
        'placeholder= "placeholder" input-placeholder="inputPlaceholder" ' +
        'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'externalNumber\')"' +
        'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select></div> ' +
        '<div ng-show="row.entity.didDnMapMsg !== undefined"> ' +
        '<cs-select name="grid.appScope.noExternalNumber" ' +
        'ng-model="row.entity.externalNumber" options="grid.appScope.externalNumberPool" class="select-warning"' +
        'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select>' +
        '<span class="warning did-map-error">{{row.entity.didDnMapMsg | translate }}</span> </div> ';

      $scope.noExtInPool = $translate.instant('usersPage.notApplicable');
      $scope.noExternalNum = $translate.instant('usersPage.notApplicable');

      $scope.$watch('model.userList', function (newVal, oldVal) {
        if (newVal != oldVal) {
          $scope.usrlist = $window.addressparser.parse($scope.model.userList);
        }
      });

      // To differentiate the user list change made by map operation
      //  and other manual/reset operation.
      $scope.$watch('usrlist', function (newVal, oldVal) {
        if ($scope.isMapped) {
          $scope.isMapped = false;
        } else {
          $scope.isMapEnabled = true;
        }

        if ($scope.isReset) {
          $scope.isReset = false;
        } else {
          $scope.isResetEnabled = true;
        }
      }, true);

      $scope.$watch('radioStates.commRadio', function (newVal, oldVal) {
        if (newVal != oldVal) {
          // Do not change wizard text when configuring bulk user services
          if (angular.isDefined($scope.wizard) && !($scope.wizard.current.step.name === 'csvServices' || $scope.wizard.current.step.name === 'dirsyncServices')) {
            if ($scope.radioStates.commRadio) {
              $scope.$emit('wizardNextText', 'next');
            } else {
              $scope.$emit('wizardNextText', 'finish');
            }
          }
        }
      });

      $scope.$watch('wizard.current.step', function (newVal, oldVal) {
        if (angular.isDefined($scope.wizard) && $scope.wizard.current.step.name === 'assignServices') {
          if ($scope.radioStates.commRadio || $scope.entitlements.ciscoUC) {
            $scope.$emit('wizardNextText', 'next');
          } else {
            $scope.$emit('wizardNextText', 'finish');
          }
        } else if (angular.isDefined($scope.wizard) && $scope.wizard.current.step.name === 'assignDnAndDirectLines') {
          $scope.isResetEnabled = false;
          $scope.validateDnForUser();
        }
      });

      $scope.validateDnForUser = function () {
        if ($scope.isDnNotAvailable()) {
          $scope.$emit('wizardNextButtonDisable', true);
        } else {
          $scope.$emit('wizardNextButtonDisable', false);
        }
      };

      $scope.isResetEnabled = false;
      $scope.validateDnForUser();

      $scope.addDnGridOptions = {
        data: 'usrlist',
        enableRowSelection: false,
        multiSelect: false,
        rowHeight: 45,
        enableRowHeaderSelection: false,
        enableColumnResize: true,
        enableColumnMenus: false,
        columnDefs: [{
          field: 'name',
          displayName: $translate.instant('usersPage.nameHeader'),
          sortable: false,
          cellTemplate: nameTemplate,
          width: '42%',
          height: 35
        }, {
          field: 'externalNumber',
          displayName: $translate.instant('usersPage.directLineHeader'),
          sortable: false,
          cellTemplate: externalExtensionTemplate,
          width: '33%',
          height: 35
        }, {
          field: 'internalExtension',
          displayName: $translate.instant('usersPage.extensionHeader'),
          sortable: false,
          cellTemplate: internalExtensionTemplate,
          width: '25%',
          height: 35
        }]
      };
      $scope.collabRadio = 1;

      $scope.onboardUsers = onboardUsers;

      var usersList = [];

      /**
       * get the current license settings for the CF_ licenses
       *
       * @param {string[]} state - return license list based on matching state (checked = true)
       */
      var getConfIdList = function (state) {
        var idList = [];

        _.forEach($scope.allLicenses, function (license) {
          if (!_.isArray(license) && license.confModel === state) {
            idList.push(license.licenseId);
          }
          idList = idList.concat(_(license.confLic).filter({
            confModel: state
          }).pluck('licenseId').remove(undefined).value());

          idList = idList.concat(_(license.cmrLic).filter({
            cmrModel: state
          }).pluck('licenseId').remove(undefined).value());

        });

        return idList;
      };

      /**
       * get the list of selected account licenses on the dialog
       *
       * @param {null|Object[]} action - 'additive' - add new licenses only, 'patch' - remove any licenses not specified
       */
      var getAccountLicenses = function (action) {
        var licenseList = [];
        if (Authinfo.hasAccount()) {
          // Messaging: prefer selected subscription, if specified
          if ('licenseId' in $scope.radioStates.subLicense) {
            licenseList.push(new LicenseFeature($scope.radioStates.subLicense.licenseId, true));
          } else {
            var msgIndex = $scope.radioStates.msgRadio ? 1 : 0;
            var selMsgService = $scope.messageFeatures[msgIndex];
            // TODO (tohagema): clean up messageFeatures license(s) model :/
            var license = selMsgService.license || selMsgService.licenses[0];
            if ('licenseId' in license) {
              // Add new licenses
              licenseList.push(new LicenseFeature(license.licenseId, true));
            } else if ((action === 'patch') && ($scope.messageFeatures.length > 1) && ('licenseId' in $scope.messageFeatures[1].licenses[0])) {
              // Remove existing license
              licenseList.push(new LicenseFeature($scope.messageFeatures[1].licenses[0].licenseId, false));
            }
          }

          // Conferencing: depends on model (standard vs. CMR)
          var cidListAdd = getConfIdList(true);
          for (var i = 0; i < cidListAdd.length; i++) {
            licenseList.push(new LicenseFeature(cidListAdd[i], true));
          }
          if (action === 'patch') {
            var cidListRemove = getConfIdList(false);
            for (i = 0; i < cidListRemove.length; i++) {
              licenseList.push(new LicenseFeature(cidListRemove[i], false));
            }
          }

          // Communication: straightforward license, for now
          var commIndex = $scope.radioStates.commRadio ? 1 : 0;
          var selCommService = $scope.communicationFeatures[commIndex];
          if ('licenseId' in selCommService.license) {
            licenseList.push(new LicenseFeature(selCommService.license.licenseId, true));
          } else if ((action === 'patch') && ($scope.communicationFeatures.length > 1) && ('licenseId' in $scope.communicationFeatures[1].license)) {
            licenseList.push(new LicenseFeature($scope.communicationFeatures[1].license.licenseId, false));
          }
        }

        return licenseList.length === 0 ? null : licenseList;
      };

      var getEntitlements = function (action) {
        var entitleList = [];
        var state = null;
        for (var key in $scope.entitlements) {
          state = $scope.entitlements[key];
          if ((action === 'add' && state) || (action === 'entitle' && state)) {
            entitleList.push(new Feature(key, state));
          }
        }

        Log.debug(entitleList);
        return entitleList;
      };

      var getEntitlementStrings = function (entList) {
        var entStrings = [];
        for (var e = 0; e < entList.length; e++) {
          if (entList[e].entitlementName) {
            entStrings.push(entList[e].entitlementName);
          }
        }
        return entStrings;
      };

      $scope.updateUserLicense = function () {
        var user = [];
        if ($scope.currentUser) {
          usersList = [];
          var userObj = {
            'address': $scope.currentUser.userName,
            'name': $scope.currentUser.name
          };
          user.push(userObj);
          usersList.push(user);
        }
        $scope.btnSaveEntLoad = true;

        Userservice.updateUsers(user, getAccountLicenses('patch'), null, 'updateUserLicense', entitleUserCallback);
      };

      //****************MODAL INIT FUNCTION FOR INVITE AND ADD***************
      //***
      //***
      //*********************************************************************

      function Feature(name, state) {
        this.entitlementName = name;
        this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
        this.properties = {};
      }

      function LicenseFeature(name, bAdd) {
        return {
          id: name.toString(),
          idOperation: bAdd ? 'ADD' : 'REMOVE',
          properties: {}
        };
      }

      $scope.isAddEnabled = function () {
        return Authinfo.isAddUserEnabled();
      };

      $scope.isEntitleEnabled = function () {
        return Authinfo.isEntitleUserEnabled();
      };

      //email validation logic
      var validateEmail = function (input) {
        var emailregex = /\S+@\S+\.\S+/;
        var emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
        var emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
        var valid = false;

        if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
          valid = true;
        } else if (/["]/.test(input) && emailregexquotes.test(input)) {
          valid = true;
        } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
          valid = true;
        }

        return valid;
      };

      var wizardNextText = function () {
        var userCount = angular.element('.token-label').length;
        var action = 'finish';
        if (userCount > 0) {
          action = 'next';
        }
        $scope.$emit('wizardNextText', action);
      };

      var invalidcount = 0;
      $scope.tokenfieldid = "usersfield";
      $scope.tokenplaceholder = $translate.instant('usersPage.userInput');
      $scope.tokenoptions = {
        delimiter: [',', ';'],
        createTokensOnBlur: true
      };
      var isDuplicate = false;
      $scope.tokenmethods = {
        createtoken: function (e) {
          //Removing anything in brackets from user data
          var value = e.attrs.value.replace(/\s*\([^)]*\)\s*/g, ' ');
          e.attrs.value = value;
          isDuplicate = false;
          if (isEmailAlreadyPresent(e.attrs.value)) {
            isDuplicate = true;
          }
        },
        createdtoken: function (e) {
          if (!validateEmail(e.attrs.value) || isDuplicate) {
            angular.element(e.relatedTarget).addClass('invalid');
            invalidcount++;
          }
          wizardNextText();
          checkPlaceholder();
        },
        edittoken: function (e) {
          if (angular.element(e.relatedTarget).hasClass('invalid')) {
            invalidcount--;
          }
        },
        removedtoken: function (e) {
          // Reset the token list and validate all tokens
          $timeout(function () {
            invalidcount = 0;
            angular.element('#usersfield').tokenfield('setTokens', $scope.model.userList);
          }).then(function () {
            wizardNextText();
            checkPlaceholder();
          });
        }
      };

      function isEmailAlreadyPresent(input) {
        var inputEmail = getEmailAddress(input).toLowerCase();
        if (inputEmail) {
          var userEmails = getTokenEmailArray();
          var userEmailsLower = [];
          for (var i = 0; i < userEmails.length; i++) {
            userEmailsLower[i] = userEmails[i].toLowerCase();
          }
          return userEmailsLower.indexOf(inputEmail) >= 0;
        } else {
          return false;
        }
      }

      function getTokenEmailArray() {
        var tokens = angular.element('#usersfield').tokenfield('getTokens');
        return tokens.map(function (token) {
          return getEmailAddress(token.value);
        });
      }

      function getEmailAddress(input) {
        var retString = "";
        input.split(" ").forEach(function (str) {
          if (str.indexOf("@") >= 0) {
            retString = str;
          }
        });
        return retString;
      }

      var setPlaceholder = function (placeholder) {
        angular.element('.tokenfield.form-control #usersfield-tokenfield').attr('placeholder', placeholder);
      };

      //placeholder logic
      function checkPlaceholder() {
        if (angular.element('.token-label').length > 0) {
          setPlaceholder('');
        } else {
          setPlaceholder($translate.instant('usersPage.userInput'));
        }
      }

      var getUsersList = function () {
        return $window.addressparser.parse($scope.model.userList);
      };

      $scope.validateTokensBtn = function () {
        var usersListLength = angular.element('.token-label').length;
        $scope.validateTokens().then(function () {
          if (invalidcount === 0 && usersListLength > 0) {
            $state.go('users.add.services');
          } else if (usersListLength === 0) {
            Log.debug('No users entered.');
            Notification.notify([$translate.instant('usersPage.noUsersInput')], 'error');
          } else {
            Log.debug('Invalid users entered.');
            Notification.notify([$translate.instant('usersPage.validEmailInput')], 'error');
          }
        });
      };

      $scope.validateTokens = function () {
        wizardNextText();
        return $timeout(function () {
          var tokenfield = angular.element('#usersfield');
          //reset the invalid count
          invalidcount = 0;
          angular.element('#usersfield').tokenfield('setTokens', $scope.model.userList);
        }, 100);
      };

      $scope.addToUsersfield = function () {
        if ($scope.model.userForm.$valid && $scope.model.userInfoValid) {
          var userInfo = $scope.model.firstName + NAME_DELIMITER + $scope.model.lastName + ' ' + $scope.model.emailAddress;
          angular.element('#usersfield').tokenfield('createToken', userInfo);
          clearNameAndEmailFields();
          angular.element('#firstName').focus();
        }
      };

      $scope.validateEmailField = function () {
        if ($scope.model.emailAddress) {
          $scope.model.userInfoValid = validateEmail($scope.model.emailAddress);
        } else {
          $scope.model.userInfoValid = false;
        }
      };

      $scope.onEnterKey = function (keyEvent) {
        if (keyEvent.which === 13) {
          $scope.addToUsersfield();
        }
      };

      var resetUsersfield = function () {
        angular.element('#usersfield').tokenfield('setTokens', ' ');
        $scope.model.userList = '';
        checkPlaceholder();
        invalidcount = 0;
      };

      $scope.clearPanel = function () {
        resetUsersfield();
        $scope.radioStates.subLicense = {};
        $scope.results = null;
      };

      function onboardUsers(optionalOnboard) {
        var deferred = $q.defer();
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);
        var callback = function (data, status) {
          if (data.success) {
            Log.info('User onboard request returned:', data);
            $rootScope.$broadcast('USER_LIST_UPDATED');
            var numAddedUsers = 0;
            var addedUsersList = [];

            for (var num = 0; num < data.userResponse.length; num++) {
              if (data.userResponse[num].status === 200 || data.userResponse[num].status === 201) {
                numAddedUsers++;
              }
            }

            if (numAddedUsers > 0) {
              var msg = 'Invited ' + numAddedUsers + ' users';
              LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), numAddedUsers, null);
            }

            for (var i = 0; i < data.userResponse.length; i++) {
              var userResult = {
                email: data.userResponse[i].email,
                alertType: null
              };

              var userStatus = data.userResponse[i].status;

              if (userStatus === 200) {
                userResult.message = $translate.instant('usersPage.onboardSuccess', userResult);
                userResult.alertType = 'success';
                // Make list of successfully onboarded users
                var addItem = {
                  address: data.userResponse[i].email
                };
                if (addItem.address.length > 0) {
                  addedUsersList.push(addItem);
                }
              } else if (userStatus === 409) {
                userResult.message = userResult.email + ' ' + data.userResponse[i].message;
                userResult.alertType = 'danger';
                isComplete = false;
              } else if (userStatus === 403) {
                if (data.userResponse[i].message === '400081') {
                  userResult.message = $translate.instant('usersPage.userExistsError', {
                    email: userResult.email
                  });
                } else if (data.userResponse[i].message === '400084') {
                  userResult.message = $translate.instant('usersPage.claimedDomainError', {
                    email: userResult.email,
                    domain: userResult.email.split('@')[1]
                  });
                }
                userResult.alertType = 'danger';
                isComplete = false;
              } else {
                userResult.message = $translate.instant('usersPage.onboardError', {
                  email: userResult.email,
                  status: userStatus
                });
                userResult.alertType = 'danger';
                isComplete = false;
              }

              $scope.results.resultList.push(userResult);
            }

            // Hybrid Service entitlements must be added after onboarding
            assignHybridServices($scope.extensionEntitlements, addedUsersList).then(function () {
              //concatenating the results in an array of strings for notify function
              var successes = [];
              var errors = [];
              var count_s = 0;
              var count_e = 0;
              for (var idx in $scope.results.resultList) {
                if ($scope.results.resultList[idx].alertType === 'success') {
                  successes[count_s] = $scope.results.resultList[idx].message;
                  count_s++;
                } else {
                  errors[count_e] = $scope.results.resultList[idx].message;
                  count_e++;
                }
              }
              //Displaying notifications
              if (successes.length + errors.length === usersList.length) {
                $scope.btnOnboardLoading = false;
                Notification.notify(successes, 'success');
                Notification.notify(errors, 'error');
                deferred.resolve();
              }

              if (angular.isFunction($scope.$dismiss) && successes.length === usersList.length) {
                $scope.$dismiss();
              }
            });
          } else {
            Log.warn('Could not onboard the user', data);
            var error = null;
            if (status) {
              error = $translate.instant('errors.statusError', {
                status: status
              });
              if (data && angular.isString(data.message)) {
                error += ' ' + $translate.instant('usersPage.messageError', {
                  message: data.message
                });
              }
            } else {
              error = 'Request failed.';
              if (angular.isString(data)) {
                error += ' ' + data;
              }
              Notification.notify(error, 'error');
            }
            Notification.notify([error], 'error');
            isComplete = false;
            $scope.btnOnboardLoading = false;
            deferred.reject();
          }
          //no need to clear tokens here since that is causing the options grid to blank during the finish process
        };

        if (angular.isArray(usersList) && usersList.length > 0) {
          $scope.btnOnboardLoading = true;

          var i, j;
          for (i = 0; i < usersList.length; i++) {
            var userAndDnObj = $scope.usrlist.filter(function (user) {
              return (user.address == usersList[i].address);
            });

            if (userAndDnObj[0].assignedDn && userAndDnObj[0].assignedDn.pattern.length > 0) {
              usersList[i].internalExtension = userAndDnObj[0].assignedDn.pattern;
            }
            if (userAndDnObj[0].externalNumber && userAndDnObj[0].externalNumber.pattern !== "None") {
              usersList[i].directLine = userAndDnObj[0].externalNumber.pattern;
            }
          }

          var tempUserArray = [],
            entitleList = [],
            licenseList = [],
            chunk = Config.batchSize;
          if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
            licenseList = getAccountLicenses('additive');
          } else {
            entitleList = getEntitlements('add');
          }
          for (i = 0; i < usersList.length; i += chunk) {
            tempUserArray = usersList.slice(i, i + chunk);
            Userservice.onboardUsers(tempUserArray, entitleList, licenseList, callback);
          }
        } else if (!optionalOnboard) {
          Log.debug('No users entered.');
          var error = [$translate.instant('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
          deferred.reject();
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      }

      $scope.extensionEntitlements = [];
      $scope.updateExtensionEntitlements = function (entitlements) {
        $scope.extensionEntitlements = entitlements;
      };

      function assignHybridServices(entitlements, usersList) {
        var deferred = $q.defer();

        if (angular.isArray(usersList) && usersList.length && _.isArray(entitlements) && entitlements.length) {
          Userservice.updateUsers(usersList, null, entitlements, 'updateEntitlement', callback);
        } else {
          // No hybrid services to assign
          deferred.resolve();
        }

        function callback(data) {
          if (data.success) {
            var successResponses = [];
            var failureResponses = [];
            var userResponses = data.userResponse;

            _.each(userResponses, function (response) {
              var userStatus = response.status;
              var msg;
              var errorMsg = response.message;

              if (userStatus === 404) {
                msg = $translate.instant('hercules.hybridServices.result404', {
                  email: response.email
                });
                failureResponses.push(msg);
              } else if (userStatus === 409) {
                msg = $translate.instant('hercules.hybridServices.result409');
                failureResponses.push(msg);
              } else if (userStatus != 200) {
                if (errorMsg === '400087') {
                  msg = $translate.instant('hercules.hybridServices.result400087', {
                    email: response.email
                  });
                } else {
                  msg = $translate.instant('hercules.hybridServices.resultOther', {
                    email: response.email,
                    status: userStatus
                  });
                }
                failureResponses.push(msg);
              }
            });

            Notification.notify(successResponses, 'success');
            Notification.notify(failureResponses, 'error');
          } else {
            Log.error('Failed updating users with entitlements.');
            Log.error(data);
            Notification.notify('Failed to update entitlements.', 'error');
          }
          deferred.resolve();
        }

        return deferred.promise;
      }

      function entitleUserCallback(data, status, method) {
        $scope.results = {
          resultList: []
        };
        var isComplete = true;

        $rootScope.$broadcast('USER_LIST_UPDATED');
        if (data.success) {
          Log.info('User successfully updated', data);

          for (var i = 0; i < data.userResponse.length; i++) {

            var userResult = {
              email: data.userResponse[i].email,
              alertType: null
            };

            var userStatus = data.userResponse[i].status;

            if (userStatus === 200) {
              userResult.message = $translate.instant('onboardModal.result.200');
              userResult.alertType = 'success';
            } else if (userStatus === 404) {
              userResult.message = $translate.instant('onboardModal.result.404');
              userResult.alertType = 'danger';
              isComplete = false;
            } else if (userStatus === 409) {
              userResult.message = $translate.instant('onboardModal.result.409');
              userResult.alertType = 'danger';
              isComplete = false;
            } else {
              userResult.message = $translate.instant('onboardModal.result.other', {
                status: userStatus
              });
              userResult.alertType = 'danger';
              isComplete = false;
            }
            $scope.results.resultList.push(userResult);
            if (method !== 'convertUser') {
              $scope.$dismiss();
            }
          }

          //concatenating the results in an array of strings for notify function
          var successes = [];
          var errors = [];
          var count_s = 0;
          var count_e = 0;
          for (var idx in $scope.results.resultList) {
            if ($scope.results.resultList[idx].alertType === 'success') {
              successes[count_s] = $scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message;
              count_s++;
            } else {
              errors[count_e] = $scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message;
              count_e++;
            }
          }

          //Displaying notifications
          if (method !== 'convertUser') {
            if (successes.length + errors.length === usersList.length) {
              $scope.btnOnboardLoading = false;
              $scope.btnSaveEntLoad = false;
              Notification.notify(successes, 'success');
              Notification.notify(errors, 'error');
            }
          } else {
            if (count_s > 0) {
              convertSuccess.push.apply(convertSuccess, successes);
            }
            if (count_e > 0) {
              convertFailures.push.apply(convertFailures, errors);
            }
          }

        } else {
          Log.warn('Could not entitle the user', data);
          var error = null;
          if (status) {
            error = $translate.instant('error.statusError', {
              status: status
            });
            if (data && angular.isString(data.message)) {
              error += ' ' + $translate.instant('usersPage.messageError', {
                message: data.message
              });
            }
          } else {
            error = 'Request failed.';
            if (angular.isString(data)) {
              error += ' ' + data;
            }
          }
          if (method !== 'convertUser') {
            Notification.notify([error], 'error');
            isComplete = false;
            $scope.btnOnboardLoading = false;
            $scope.btnSaveEntLoad = false;
          } else {
            convertFailures.push(error);
          }
        }

        if (method !== 'convertUser') {
          if (isComplete) {
            resetUsersfield();
          }
        } else {
          if ($scope.convertSelectedList.length > 0 && convertCancelled === false && convertBacked === false) {
            convertUsersInBatch();
          } else {
            if (convertBacked === false) {
              $scope.btnConvertLoad = false;
              $scope.$dismiss();
            } else {
              $state.go('users.convert', {});
            }
            Notification.notify(convertSuccess, 'success');
            Notification.notify(convertFailures, 'error');
            var msg = 'Migrated ' + convertSuccess.length + ' users';
            var migratedata = {
              totalUsers: convertUsersCount,
              successfullyConverted: convertSuccess.length
            };
            LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('convertUsers'), LogMetricsService.getEventAction('buttonClick'), 200, convertStartTime, convertSuccess.length, migratedata);
          }
        }

      }

      //radio group
      $scope.entitlements = {};
      var setEntitlementList = function () {
        if (angular.isArray($rootScope.services)) {
          for (var i = 0; i < $rootScope.services.length; i++) {
            var svc = $rootScope.services[i].serviceId;

            $scope.entitlements[svc] = false;
            if (svc === 'webExSquared') {
              $scope.entitlements[svc] = true;
            }
          }
        }
        $scope.entitlementsKeys = Object.keys($scope.entitlements).sort().reverse();
      };

      $scope.$on('AuthinfoUpdated', function () {
        if (angular.isArray($rootScope.services) && $rootScope.services.length === 0) {
          $rootScope.services = Authinfo.getServices();
        }
        setEntitlementList();
      });

      // Wizard hook for next button
      $scope.manualEntryNext = function () {
        var deferred = $q.defer();

        if (getUsersList().length === 0) {
          $q.when($scope.wizard.nextTab()).then(function () {
            deferred.reject();
          });
        } else {
          if (invalidcount === 0) {
            deferred.resolve();
          } else {
            var error = [$translate.instant('usersPage.validEmailInput')];
            Notification.notify(error, 'error');
            deferred.reject();
          }
        }
        return deferred.promise;
      };
      // Wizard hook for save button
      $scope.assignServicesNext = function () {
        var deferred = $q.defer();

        if ($scope.radioStates.commRadio || $scope.entitlements.ciscoUC) {
          $scope.processing = true;
          activateDID();
          deferred.resolve();
        } else {
          return onboardUsers(true).then(function () {
            if (angular.isDefined($scope.wizard)) {
              $q.when($scope.wizard.nextTab()).then(function () {
                deferred.reject();
              });
            } else {
              deferred.resolve();
            }
          });
        }
        return deferred.promise;
      };

      $scope.getServicesNextText = function () {
        if ($scope.radioStates.commRadio || $scope.entitlements.ciscoUC) {
          return 'common.next';
        } else {
          return 'common.save';
        }
      };

      // Wizard hook for modal save button
      $scope.assignDnAndDirectLinesNext = function () {
        var deferred = $q.defer();
        var didDnDupes = checkDidDnDupes();
        // check for DiD duplicates
        if (didDnDupes.didDupe) {
          Log.debug('Duplicate Direct Line entered.');
          Notification.notify([$translate.instant('usersPage.duplicateDidFound')], 'error');
          deferred.reject();
          return deferred.promise;
        }
        // check for Dn duplicates
        if (didDnDupes.dnDupe) {
          Log.debug('Duplicate Internal Extension entered.');
          Notification.notify([$translate.instant('usersPage.duplicateDnFound')], 'error');
          deferred.reject();
          return deferred.promise;
        }
        return onboardUsers(true);
      };

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      $scope.getServiceName = function (service) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i];
          if (svc.serviceId === service) {
            return svc.displayName;
          }
        }
      };

      $scope.shouldAddIndent = function (key, reference) {
        return key !== reference;
      };

      var watchCheckboxes = function () {
        $timeout(function () {});
        var flag = false;
        $scope.$watchCollection('entitlements', function (newEntitlements, oldEntitlements) {
          if (flag) {
            flag = false;
            return;
          }
          var changedKey = Utils.changedKey(newEntitlements, oldEntitlements);
          if (changedKey === 'webExSquared' && !newEntitlements.webExSquared && Utils.areEntitlementsActive($scope.entitlements)) {
            for (var key in $scope.entitlements) {
              if (key !== 'webExSquared') {
                $scope.entitlements[key] = false;
                flag = true;
              }
            }
            $scope.saveDisabled = false;
          } else if (!$scope.entitlements.webExSquared && !oldEntitlements[changedKey] && changedKey !== 'webExSquared') {
            $scope.entitlements.webExSquared = true;
            $scope.saveDisabled = false;
          } else if (newEntitlements !== oldEntitlements) {
            $scope.saveDisabled = false;
          }

          if (changedKey === 'ciscoUC' && newEntitlements[changedKey]) {
            $scope.$emit('wizardNextText', 'next');
          } else if (changedKey === 'ciscoUC') {
            $scope.$emit('wizardNextText', 'finish');
          }

        });
      };

      //set intitially when loading the page
      //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
      setEntitlementList();
      watchCheckboxes();

      $scope.cancelConvert = function () {
        if (convertPending === true) {
          convertCancelled = true;
        } else {
          $scope.$dismiss();
        }
      };

      $scope.goToConvertUsers = function () {
        if (convertPending === true) {
          convertBacked = true;
        } else {
          $state.go('users.convert', {});
        }
      };

      $scope.assignDNForConvertUsers = function () {
        var didDnDupes = checkDidDnDupes();
        // check for DiD duplicates
        if (didDnDupes.didDupe) {
          Log.debug('Duplicate Direct Line entered.');
          Notification.notify([$translate.instant('usersPage.duplicateDidFound')], 'error');
          return;
        }
        // check for Dn duplicates
        if (didDnDupes.dnDupe) {
          Log.debug('Duplicate Internal Extension entered.');
          Notification.notify([$translate.instant('usersPage.duplicateDnFound')], 'error');
          return;
        }

        // copy numbers to convertSelectedList
        angular.forEach($scope.usrlist, function (user, index) {
          var userArray = $scope.convertSelectedList.filter(function (selectedUser) {
            return user.address === selectedUser.userName;
          });
          userArray[0].assignedDn = user.assignedDn;
          userArray[0].externalNumber = user.externalNumber;
        });

        return $scope.convertUsers();
      };

      $scope.saveConvertList = function () {
        $scope.selectedState = $scope.gridApi.saveState.save();
        $scope.convertSelectedList = $scope.gridApi.selection.getSelectedRows();
        convertUsersCount = $scope.convertSelectedList.length;
        $scope.convertUsersFlow = true;
        convertPending = false;
        $state.go('users.convert.services', {});
      };

      $scope.convertUsersNext = function () {
        if ($scope.radioStates.commRadio || $scope.entitlements.ciscoUC) {
          $scope.processing = true;
          // Copying selected users to user list
          $scope.usrlist = [];
          angular.forEach($scope.convertSelectedList, function (selectedUser, index) {
            var user = {};
            var givenName = "";
            var familyName = "";
            if (angular.isDefined(selectedUser.name)) {
              if (angular.isDefined(selectedUser.name.givenName)) {
                givenName = selectedUser.name.givenName;
              }
              if (angular.isDefined(selectedUser.name.familyName)) {
                familyName = selectedUser.name.familyName;
              }
            }
            if (angular.isDefined(givenName) || angular.isDefined(familyName)) {
              user.name = givenName + ' ' + familyName;
            }
            user.address = selectedUser.userName;
            $scope.usrlist.push(user);
          });
          activateDID();
          $state.go('users.convert.services.dn');
        } else {
          $scope.convertUsers();
        }
      };

      $scope.convertUsers = function () {
        $scope.btnConvertLoad = true;
        convertPending = true;
        convertCancelled = false;
        convertBacked = false;
        convertSuccess = [];
        convertFailures = [];
        convertStartTime = moment();
        convertUsersInBatch();
      };

      function convertUsersInBatch() {
        var batch = $scope.convertSelectedList.slice(0, Config.batchSize);
        $scope.convertSelectedList = $scope.convertSelectedList.slice(Config.batchSize);
        Userservice.migrateUsers(batch, function (data, status) {
          var successMovedUsers = [];

          for (var i = 0; i < data.userResponse.length; i++) {
            if (data.userResponse[i].status !== 200) {
              convertFailures.push(data.userResponse[i].email + $translate.instant('homePage.convertError'));
            } else {
              var user = {
                'address': data.userResponse[i].email
              };
              var userArray = batch.filter(function (batchObj) {
                return user.address === batchObj.userName;
              });
              user.assignedDn = userArray[0].assignedDn;
              user.externalNumber = userArray[0].externalNumber;
              successMovedUsers.push(user);
            }
          }

          if (successMovedUsers.length > 0) {
            var entitleList = [];
            var licenseList = [];
            if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
              licenseList = getAccountLicenses('patch');
            } else {
              entitleList = getEntitlements('add');
            }
            Userservice.updateUsers(successMovedUsers, licenseList, entitleList, 'convertUser', entitleUserCallback);
          } else {
            if ($scope.convertSelectedList.length > 0 && convertCancelled === false && convertBacked === false) {
              convertUsersInBatch();
            } else {
              if (convertBacked === false) {
                $scope.btnConvertLoad = false;
                $scope.$dismiss();
              } else {
                $state.go('users.convert', {});
              }
              Notification.notify(convertSuccess, 'success');
              Notification.notify(convertFailures, 'error');
              var msg = 'Migrated ' + convertSuccess.length + ' users';
              var migratedata = {
                totalUsers: convertUsersCount,
                successfullyConverted: convertSuccess.length
              };
              LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('convertUsers'), LogMetricsService.getEventAction('buttonClick'), 200, convertStartTime, convertSuccess.length, migratedata);
            }
          }
        });
      }

      var getUnlicensedUsers = function () {
        Orgservice.getUnlicensedUsers(function (data) {
          $scope.unlicensed = 0;
          $scope.unlicensedUsersList = null;
          if (data.success) {
            if (data.totalResults) {
              $scope.unlicensed = data.totalResults;
              $scope.unlicensedUsersList = data.resources;
              $('.ui-grid-viewport').mouseover(function () {
                $('.ui-grid-viewport').getNiceScroll().resize();
              });
            }
          }
        });
      };

      $scope.convertDisabled = function () {
        return ($scope.gridApi.selection.getSelectedRows().length === 0) ? true : false;
      };

      getUnlicensedUsers();

      $scope.convertGridOptions = {
        data: 'unlicensedUsersList',
        rowHeight: 45,
        enableHorizontalScrollbar: 0,
        selectionRowHeaderWidth: 40,
        enableRowHeaderSelection: true,
        enableFullRowSelection: true,
        useExternalSorting: false,
        enableColumnMenus: false,
        showFilter: false,
        saveSelection: true,
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          if ($scope.selectedState) {
            $timeout(function () {
              gridApi.saveState.restore($scope, $scope.selectedState);
            }, 100);
          }
        },
        columnDefs: [{

          field: 'displayName',
          displayName: $translate.instant('usersPage.displayNameHeader'),
          resizable: false,
          sortable: true
        }, {
          field: 'userName',
          displayName: $translate.instant('homePage.emailAddress'),
          resizable: false,
          sort: {
            direction: 'desc',
            priority: 0
          },
          sortCellFiltered: true
        }]
      };

      /////////////////////////////
      // Bulk CSV Onboarding logic
      var userArray = [];
      var isCsvValid = false;
      var cancelDeferred;
      var saveDeferred;
      var csvHeaders;
      var isDirSync = false;
      FeatureToggleService.supportsDirSync().then(function (enabled) {
        isDirSync = enabled;
      });

      $scope.onFileSizeError = function () {
        Notification.notify([$translate.instant('firstTimeWizard.csvMaxSizeError')], 'error');
      };

      $scope.onFileTypeError = function () {
        Notification.notify([$translate.instant('firstTimeWizard.csvFileTypeError')], 'error');
      };

      $scope.$watch('model.file', function (value) {
        $timeout(validateCsv);
      });
      $scope.resetFile = resetFile;

      function validateCsv() {
        if ($scope.model.file) {
          setUploadProgress(0);
          userArray = $.csv.toArrays($scope.model.file);
          if (angular.isArray(userArray) && userArray.length > 0) {
            if (userArray[0][0] === 'First Name') {
              csvHeaders = userArray.shift();
            }
            if (userArray.length > 0) {
              isCsvValid = true;
            }
          }
          setUploadProgress(100);
        } else {
          isCsvValid = false;
        }
      }

      function setUploadProgress(percent) {
        $scope.model.uploadProgress = percent;
        $scope.$digest();
      }

      function resetFile() {
        $scope.model.file = null;
      }

      // Wizard hook
      $scope.csvUploadNext = function () {
        var deferred = $q.defer();

        if (isCsvValid) {
          deferred.resolve();
        } else {
          var error;
          if (userArray.length === 0) {
            error = [$translate.instant('firstTimeWizard.uploadCsvEmpty')];
          }
          Notification.notify(error, 'error');
          deferred.reject();
        }

        return deferred.promise;
      };

      // Wizard hook
      $scope.csvProcessingNext = bulkSave;
      FeatureToggleService.supportsCsvUpload().then(function (enabled) {
        if (enabled) {
          $scope.csvProcessingNext = bulkSaveWithIndividualLicenses;
        }
      });

      $scope.initBulkMetric = initBulkMetric;
      $scope.sendBulkMetric = sendBulkMetric;

      var bulkStartLog = moment();

      function initBulkMetric() {
        bulkStartLog = moment();
      }

      function sendBulkMetric() {
        var eType = LogMetricsService.getEventType('bulkCsvUsers');
        var currentStepName = _.get($scope, 'wizard.current.step.name', 'csvResult');
        if (currentStepName === 'dirsyncResult') {
          eType = LogMetricsService.getEventType('bulkDirSyncUsers');
        }
        var data = {
          'newUsersCount': $scope.model.numNewUsers || 0,
          'updatedUsersCount': $scope.model.numExistingUsers || 0,
          'errorUsersCount': angular.isArray($scope.model.userErrorArray) ? $scope.model.userErrorArray.length : 0
        };
        LogMetricsService.logMetrics('Finished bulk processing', eType, LogMetricsService.getEventAction('buttonClick'), 200, bulkStartLog, 1, data);
      }

      function bulkSaveWithIndividualLicenses() {
        saveDeferred = $q.defer();
        cancelDeferred = $q.defer();

        $scope.model.userErrorArray = [];
        $scope.model.numMaxUsers = userArray.length;
        $scope.model.processProgress = $scope.model.numTotalUsers = $scope.model.numNewUsers = $scope.model.numExistingUsers = 0;

        function addUserError(row, errorMsg) {
          $scope.model.userErrorArray.push({
            row: row,
            error: errorMsg
          });
        }

        function addUserErrorWithTrackingID(row, errorMsg) {
          if (angular.isDefined($http.defaults.headers.common) && angular.isDefined($http.defaults.headers.common.TrackingID)) {
            if (angular.isString(errorMsg) && errorMsg.length > 0 && !_.endsWith(errorMsg, '.')) {
              errorMsg += '.';
            }
            errorMsg += ' TrackingID: ' + $http.defaults.headers.common.TrackingID;
          }
          addUserError(row, _.trim(errorMsg));
        }

        function callback(data, status) {
          var params = this;
          if (data.success) {
            if (angular.isArray(data.userResponse)) {
              var addedUsersList = [];

              angular.forEach(data.userResponse, function (user, index) {
                if (user.status === 200 || user.status === 201) {
                  if (user.message === 'User Patched') {
                    $scope.model.numExistingUsers++;
                  } else {
                    $scope.model.numNewUsers++;
                  }
                  // Build list of successful onboards and patches
                  var addItem = {
                    address: user.email
                  };
                  if (addItem.address.length > 0) {
                    addedUsersList.push(addItem);
                  }
                } else {
                  addUserErrorWithTrackingID(params.startIndex + index + 1, getErrorResponse(user.message, user.status));
                }
              });
            } else {
              for (var i = 0; i < params.length; i++) {
                addUserErrorWithTrackingID(params.startIndex + i + 1, $translate.instant('firstTimeWizard.processBulkResponseError'));
              }
            }
          } else {
            var responseMessage = getErrorResponse(data, status);
            for (var k = 0; k < params.length; k++) {
              addUserErrorWithTrackingID(params.startIndex + k + 1, responseMessage);
            }
          }

          calculateProcessProgress();
          params.resolve();
        }

        function getErrorResponse(data, status) {
          var responseMessage;
          if (status === 400) {
            responseMessage = $translate.instant('firstTimeWizard.bulk400Error');
          } else if (status === 403 || status === 401) {
            responseMessage = $translate.instant('firstTimeWizard.bulk401And403Error');
          } else if (status === 404) {
            responseMessage = $translate.instant('firstTimeWizard.bulk404Error');
          } else if (status === 408 || status == 504) {
            responseMessage = $translate.instant('firstTimeWizard.bulk408Error');
          } else if (status === 409) {
            responseMessage = $translate.instant('firstTimeWizard.bulk409Error');
          } else if (status === 500) {
            responseMessage = $translate.instant('firstTimeWizard.bulk500Error');
          } else if (status === 502 || status === 503) {
            responseMessage = $translate.instant('firstTimeWizard.bulk502And503Error');
          } else if (status === -1) {
            responseMessage = $translate.instant('firstTimeWizard.bulkCancelledError');
          } else {
            responseMessage = $translate.instant('firstTimeWizard.processBulkError');
          }

          return responseMessage;
        }

        function onboardCsvUsers(startIndex, userArray, csvPromise) {
          return csvPromise.then(function () {
            return $q(function (resolve, reject) {
              if (userArray.length > 0) {
                Userservice.bulkOnboardUsers(userArray, callback.bind({
                  startIndex: startIndex - userArray.length + 1,
                  length: userArray.length,
                  resolve: resolve
                }), cancelDeferred.promise);
              } else {
                resolve();
              }
            });
          });

        }

        function calculateProcessProgress() {
          $scope.model.numTotalUsers = $scope.model.numNewUsers + $scope.model.numExistingUsers + $scope.model.userErrorArray.length;
          $scope.model.processProgress = Math.round($scope.model.numTotalUsers / userArray.length * 100);

          if ($scope.model.numTotalUsers >= userArray.length) {
            $scope.model.userErrorArray.sort(function (a, b) {
              return a.row - b.row;
            });
            $rootScope.$broadcast('USER_LIST_UPDATED');
            resetFile();
            saveDeferred.resolve();
          }
        }

        function isValidDID(value) {
          if (value) {
            try {
              return TelephoneNumberService.validateDID(value);
            } catch (e) {
              return false;
            }
          }
          return true;
        }

        function findHeaderIndex(name) {
          return _.findIndex(headers, function (h) {
            return h.name == name;
          });
        }

        function hasSparkCall() {
          var index = _.findIndex(headers, function (h) {
            return h.name == 'Spark Call';
          });
          return index !== -1;
        }

        function generateHeaders(serverHeaders, userHeaders) {
          var returnHeaders = [];
          var index = -1;
          if (!serverHeaders || !userHeaders) {
            return [];
          } else {
            _.forEach(userHeaders, function (uHeader) {
              index = _.findIndex(serverHeaders, function (sHeader) {
                return sHeader.name == uHeader;
              });
              if (index !== -1) {
                returnHeaders.push(serverHeaders[index]);
              }
            });
          }
          return returnHeaders || [];
        }

        function checkCalendarService() {
          return Orgservice.getHybridServiceAcknowledged().then(function (response) {
            if (response.status === 200) {
              _.forEach(response.data.items, function (item) {
                if (item.id === Config.entitlements.fusion_cal) {
                  isCalendarServiceEnabled = item.enabled;
                }
              });
            }
          });
        }

        function isTrue(inputString) {
          var bTrue = false;
          if (angular.isString(inputString)) {
            var inToUpper = inputString.toUpperCase();
            bTrue = (inToUpper === 'T' || inToUpper === 'TRUE');
          }
          return bTrue;
        }

        function isFalse(inputString) {
          var bFalse = false;
          if (angular.isString(inputString)) {
            var inToUpper = inputString.toUpperCase();
            bFalse = (inToUpper === 'F' || inToUpper === 'FALSE');
          }
          return bFalse;
        }

        function processCsvRows() {
          return CsvDownloadService.getCsv('headers').then(function (response) {
            headers = generateHeaders(response.data.columns || null, csvHeaders || null);
            csvChunk = hasSparkCall() ? 4 : 10; // Rate limit for Huron

            // TODO
            // deal with AUDP -- only one column - Phone Number

            _.forEach(userArray, function (userRow, j) {
              processingError = false;
              var firstName = '',
                lastName = '',
                displayName = '',
                id = '';
              var directoryNumber = '',
                directLine = '';
              var idxDirectoryNumber = -1,
                idxDirectLine = -1;
              var licenseList = [];
              var entitleList = [];
              var numOfActiveMessageLicenses = 0;
              var isWrongLicenseFormat = false;

              // If we haven't met the chunk size, process the next user
              if (tempUserArray.length < csvChunk) {
                // Basic data
                firstName = userRow[findHeaderIndex('First Name')];
                lastName = userRow[findHeaderIndex('Last Name')];
                displayName = userRow[findHeaderIndex('Display Name')];
                id = userRow[findHeaderIndex('User ID/Email (Required)')];
                idxDirectoryNumber = findHeaderIndex('Directory Number');
                if (idxDirectoryNumber !== -1) {
                  directoryNumber = userRow[idxDirectoryNumber];
                }
                idxDirectLine = findHeaderIndex('Direct Line');
                if (idxDirectLine !== -1) {
                  directLine = userRow[idxDirectLine];
                }
                licenseList = [];
                entitleList = [];

                // validations
                if (!id) {
                  // Report required field is missing
                  processingError = true;
                  addUserError(j + 1, $translate.instant('firstTimeWizard.csvRequiredEmail'));
                } else if (_.contains(uniqueEmails, id)) {
                  // Report a duplicate email
                  processingError = true;
                  addUserError(j + 1, $translate.instant('firstTimeWizard.csvDuplicateEmail'));
                } else if (directLine && !isValidDID(directLine)) {
                  // Report an invalid DID format
                  processingError = true;
                  addUserError(j + 1, $translate.instant('firstTimeWizard.bulkInvalidDID'));
                } else {
                  // get license and entitlements
                  _.forEach(headers, function (header, k) {
                    if (header.license) { // if this is a license column
                      if (isTrue(userRow[k])) {
                        licenseList.push(new LicenseFeature(header.license, true));
                        // Check Active Spark Message
                        if (header.name.toUpperCase().indexOf('SPARK MESSAGE') !== -1) {
                          numOfActiveMessageLicenses++;
                        }
                      } else if (isFalse(userRow[k])) {
                        // TODO - in phase 2, if allow license removal, then un-comment the next line
                        // licenseList.push(new LicenseFeature(header.license, false));
                        _.noop();
                      } else {
                        isWrongLicenseFormat = true;
                      }
                    } else if (angular.isArray(header.entitlements) && header.entitlements.length > 0) {
                      if (isTrue(userRow[k]) || isFalse(userRow[k])) {
                        _.forEach(header.entitlements, function (entitlement) {
                          // if lincense is Calendar Service, only process if it is enabled
                          if (entitlement.toUpperCase().indexOf('SQUAREDFUSIONCAL') === -1 || isCalendarServiceEnabled) {
                            if (isTrue(userRow[k])) {
                              entitleList.push(new Feature(entitlement, true));
                            } else if (isFalse(userRow[k])) {
                              // TODO - in phase 2, if allow license removal, then un-comment the next line
                              // entitleList.push(new Feature(entitlement, false));
                              _.noop();
                            }
                          }
                        });
                      } else {
                        isWrongLicenseFormat = true;
                      }
                    }
                  });

                  if (isWrongLicenseFormat) {
                    processingError = true;
                    addUserError(j + 1, $translate.instant('firstTimeWizard.csvWrongLicenseFormat'));
                  } else if (numOfActiveMessageLicenses > 1) {
                    processingError = true;
                    addUserError(j + 1, $translate.instant('firstTimeWizard.tooManyActiveMessageLicenses'));
                  } else {
                    uniqueEmails.push(id);
                    // Do not send name and displayName if it's a DirSync org
                    if (isDirSync) {
                      firstName = '';
                      lastName = '';
                      displayName = '';
                    }
                    tempUserArray.push({
                      'address': id,
                      'name': firstName + NAME_DELIMITER + lastName,
                      'displayName': displayName,
                      'internalExtension': directoryNumber,
                      'directLine': directLine,
                      'licenses': licenseList,
                      'entitlements': entitleList
                    });
                  }
                }
              }

              // Onboard all the previous users in the temp array if there was an error processing a row
              if (processingError) {
                csvPromise = onboardCsvUsers(j - 1, tempUserArray, csvPromise);
                tempUserArray = [];
              } else if (tempUserArray.length === csvChunk || j === (userArray.length - 1)) {
                // Onboard the current temp array if we've met the chunk size or is the last user in list
                csvPromise = onboardCsvUsers(j, tempUserArray, csvPromise);
                tempUserArray = [];
              }

              calculateProcessProgress();
            });
          }).catch(function (response) {
            Notification.errorResponse(response, 'firstTimeWizard.downloadHeadersError');
          });
        }

        // Onboard users in chunks
        // Separate chunks on invalid rows
        var csvChunk = 0; // Rate limit for Huron
        var csvPromise = $q.when();
        var tempUserArray = [];
        var uniqueEmails = [];
        var processingError;
        var headers;
        var isCalendarServiceEnabled = false;

        checkCalendarService().then(function () {
          return processCsvRows();
        });

        return saveDeferred.promise;
      }

      $scope.cancelProcessCsv = function () {
        cancelDeferred.resolve();
        saveDeferred.resolve();
      };

      /////////////////////////////////
      // Bulk DirSync Onboarding logic
      // Wizard hooks
      $scope.dirsyncProcessingNext = bulkSave;

      $scope.installConnectorNext = function () {
        return FeatureToggleService.supportsDirSync().then(function (dirSyncEnabled) {
          return $q(function (resolve, reject) {
            if (dirSyncEnabled) {
              // getStatus() is in the parent scope - AddUserCtrl
              if (angular.isFunction($scope.getStatus)) {
                $scope.getStatus();
                resolve();
              } else {
                reject();
              }
            } else {
              $scope.dirsyncStatus = $translate.instant('firstTimeWizard.syncNotConfigured');
              $scope.numUsersInSync = '';
              $scope.dirsyncUserCountText = '';
              resolve();
            }
          });

        });
      };

      $scope.syncStatusNext = function () {
        var deferred = $q.defer();

        if (!$scope.wizard.isLastStep()) {
          // load synced users to userArray
          // userList and useNameList are in the parent scope - AddUserCtrl
          userArray = [];
          if ($scope.userList && $scope.userList.length > 0) {
            userArray = $scope.userList.map(function (user, idx) {
              var userData = [];
              userData.push(''); // DirSync can't change first name
              userData.push(''); // DirSync can't change last name
              userData.push(''); // DirSync can't change display name
              userData.push(user.Email);
              userData.push(''); // No Directory Number
              userData.push(''); // No Direct Line
              return userData;
            });
          }

          if (userArray.length === 0) {
            Notification.error('firstTimeWizard.uploadDirSyncEmpty');
            deferred.reject();
          } else {
            deferred.resolve();
          }
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      };

      // The existing bulkSave
      // TODO- remove after the feature toggle of CSV is no longer active
      function bulkSave() {
        saveDeferred = $q.defer();
        cancelDeferred = $q.defer();

        $scope.model.userErrorArray = [];
        $scope.model.numMaxUsers = userArray.length;
        $scope.model.processProgress = $scope.model.numTotalUsers = $scope.model.numNewUsers = $scope.model.numExistingUsers = 0;

        function addUserError(row, errorMsg) {
          $scope.model.userErrorArray.push({
            row: row,
            error: errorMsg
          });
        }

        function addUserErrorWithTrackingID(row, errorMsg) {
          if (angular.isDefined($http.defaults.headers.common) && angular.isDefined($http.defaults.headers.common.TrackingID)) {
            if (angular.isString(errorMsg) && errorMsg.length > 0 && !_.endsWith(errorMsg, '.')) {
              errorMsg += '.';
            }
            errorMsg += ' TrackingID: ' + $http.defaults.headers.common.TrackingID;
          }
          addUserError(row, _.trim(errorMsg));
        }

        function callback(data, status) {
          var params = this;
          if (data.success) {
            if (angular.isArray(data.userResponse)) {
              var addedUsersList = [];

              angular.forEach(data.userResponse, function (user, index) {
                if (user.status === 200 || user.status === 201) {
                  if (user.message === 'User Patched') {
                    $scope.model.numExistingUsers++;
                  } else {
                    $scope.model.numNewUsers++;
                  }
                  // Build list of successful onboards and patches
                  var addItem = {
                    address: user.email
                  };
                  if (addItem.address.length > 0) {
                    addedUsersList.push(addItem);
                  }
                } else {
                  addUserErrorWithTrackingID(params.startIndex + index + 1, getErrorResponse(user.message, user.status));
                }
              });

              // Hybrid Service entitlements is added after onboarding
              assignHybridServices($scope.extensionEntitlements, addedUsersList).then(function () {
                _.noop();
              });

            } else {
              for (var i = 0; i < params.length; i++) {
                addUserErrorWithTrackingID(params.startIndex + i + 1, $translate.instant('firstTimeWizard.processBulkResponseError'));
              }
            }
          } else {
            var responseMessage = getErrorResponse(data, status);
            for (var k = 0; k < params.length; k++) {
              addUserErrorWithTrackingID(params.startIndex + k + 1, responseMessage);
            }
          }

          calculateProcessProgress();
          params.resolve();
        }

        function getErrorResponse(data, status) {
          var responseMessage;
          if (status === 400) {
            responseMessage = $translate.instant('firstTimeWizard.bulk400Error');
          } else if (status === 403 || status === 401) {
            responseMessage = $translate.instant('firstTimeWizard.bulk401And403Error');
          } else if (status === 404) {
            responseMessage = $translate.instant('firstTimeWizard.bulk404Error');
          } else if (status === 408 || status == 504) {
            responseMessage = $translate.instant('firstTimeWizard.bulk408Error');
          } else if (status === 409) {
            responseMessage = $translate.instant('firstTimeWizard.bulk409Error');
          } else if (status === 500) {
            responseMessage = $translate.instant('firstTimeWizard.bulk500Error');
          } else if (status === 502 || status === 503) {
            responseMessage = $translate.instant('firstTimeWizard.bulk502And503Error');
          } else if (status === -1) {
            responseMessage = $translate.instant('firstTimeWizard.bulkCancelledError');
          } else {
            responseMessage = $translate.instant('firstTimeWizard.processBulkError');
          }

          return responseMessage;
        }

        // Get license/entitlements
        var entitleList = [];
        var licenseList = [];
        var isCommunicationSelected;
        if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
          licenseList = getAccountLicenses('additive') || [];
          isCommunicationSelected = !!_.find(licenseList, function (license) {
            return _.startsWith(license.id, 'CO_');
          });
        } else {
          entitleList = getEntitlements('add');
          isCommunicationSelected = !!_.find(entitleList, {
            entitlementName: 'ciscoUC'
          });
        }

        function onboardCsvUsers(startIndex, userArray, entitlementArray, licenseArray, csvPromise) {
          return csvPromise.then(function () {
            return $q(function (resolve, reject) {
              if (userArray.length > 0) {
                Userservice.onboardUsers(userArray, entitlementArray, licenseArray, callback.bind({
                  startIndex: startIndex - userArray.length + 1,
                  length: userArray.length,
                  resolve: resolve
                }), cancelDeferred.promise);
              } else {
                resolve();
              }
            });
          });

        }

        function calculateProcessProgress() {
          $scope.model.numTotalUsers = $scope.model.numNewUsers + $scope.model.numExistingUsers + $scope.model.userErrorArray.length;
          $scope.model.processProgress = Math.round($scope.model.numTotalUsers / userArray.length * 100);

          if ($scope.model.numTotalUsers >= userArray.length) {
            $scope.model.userErrorArray.sort(function (a, b) {
              return a.row - b.row;
            });
            $rootScope.$broadcast('USER_LIST_UPDATED');
            resetFile();
            saveDeferred.resolve();
          }
        }

        function isValidDID(value) {
          // If communication license is selected and a value is defined
          if (isCommunicationSelected && value) {
            try {
              return TelephoneNumberService.validateDID(value);
            } catch (e) {
              return false;
            }
          }
          return true;
        }

        // Onboard users in chunks
        // Separate chunks on invalid rows
        var csvChunk = isCommunicationSelected ? 4 : 10; // Rate limit for Huron
        var csvPromise = $q.when();
        var tempUserArray = [];
        var uniqueEmails = [];
        var processingError;
        _.forEach(userArray, function (userRow, j) {
          processingError = false;
          // If we haven't met the chunk size, process the next user
          if (tempUserArray.length < csvChunk) {
            // Validate content in the row
            if (userRow.length !== 6) {
              // Report incorrect number of columns
              processingError = true;
              addUserError(j + 1, $translate.instant('firstTimeWizard.csvInvalidRow'));
            } else if (!userRow[3]) {
              // Report required field is missing
              processingError = true;
              addUserError(j + 1, $translate.instant('firstTimeWizard.csvRequiredEmail'));
            } else if (_.contains(uniqueEmails, userRow[3])) {
              // Report a duplicate email
              processingError = true;
              addUserError(j + 1, $translate.instant('firstTimeWizard.csvDuplicateEmail'));
            } else if (!isValidDID(userRow[5])) {
              // Report an invalid DID format
              processingError = true;
              addUserError(j + 1, $translate.instant('firstTimeWizard.bulkInvalidDID'));
            } else {
              uniqueEmails.push(userRow[3]);
              tempUserArray.push({
                address: userRow[3],
                name: userRow[0] + NAME_DELIMITER + userRow[1],
                displayName: userRow[2],
                internalExtension: userRow[4],
                directLine: userRow[5]
              });
            }
          }
          // Onboard all the previous users in the temp array if there was an error processing a row
          if (processingError) {
            csvPromise = onboardCsvUsers(j - 1, tempUserArray, entitleList, licenseList, csvPromise);
            tempUserArray = [];
          } else if (tempUserArray.length === csvChunk || j === (userArray.length - 1)) {
            // Onboard the current temp array if we've met the chunk size or is the last user in list
            csvPromise = onboardCsvUsers(j, tempUserArray, entitleList, licenseList, csvPromise);
            tempUserArray = [];
          }
        });

        calculateProcessProgress();

        return saveDeferred.promise;
      }

    }
  ]);
