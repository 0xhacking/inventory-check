describe('placeOverview component', () => {
  let Authinfo, FeatureToggleService, CsdmDataModelService, CsdmCodeService, WizardFactory, $state, $scope, $q, Userservice;

  let $stateParams;
  let $componentController;
  let controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject((_$q_,
                     _Authinfo_,
                     _CsdmDataModelService_,
                     _WizardFactory_,
                     _$state_,
                     _$stateParams_,
                     $rootScope,
                     _$componentController_,
                     _CsdmCodeService_,
                     _FeatureToggleService_,
                     _Userservice_) => {
    $q = _$q_;
    Authinfo = _Authinfo_;
    CsdmDataModelService = _CsdmDataModelService_;
    WizardFactory = _WizardFactory_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    CsdmCodeService = _CsdmCodeService_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;
  }));

  let initController = (stateParams, scope, $state) => {
    return $componentController('placeOverview', {
      $stateParams: stateParams,
      $scope: scope,
      $state: $state,
      CsdmCodeService: CsdmCodeService,
    }, null);
  };

  describe('and invoke onGenerateOtpFn', () => {
    let showATA, showHybrid, currentDevice, deviceName, displayName, email, userCisUuid, placeCisUuid;
    let orgId, adminOrgId, goStateName, goStateData;
    beforeEach(() => {

      showATA = true;
      showHybrid = true;
      deviceName = 'deviceName';
      displayName = 'displayName';
      email = 'email@address.com';
      userCisUuid = 'userCisUuid';
      placeCisUuid = 'placeCisUuid';
      orgId = 'orgId';
      adminOrgId = 'adminOrgId';
      currentDevice = {
        displayName: deviceName,
        cisUuid: placeCisUuid,
      };

      spyOn(CsdmCodeService, 'createCodeForExisting').and.returnValue($q.when('0q9u09as09vu0a9sv'));
      spyOn(FeatureToggleService, 'csdmPstnGetStatus').and.returnValue($q.when(false));
      spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.when(showATA));
      spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.when(showHybrid));
      spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
      Authinfo.displayName = displayName;
      spyOn(Authinfo, 'getUserId').and.returnValue(userCisUuid);
      spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
      spyOn(Userservice, 'getUser');
      spyOn($state, 'go').and.callFake((stateName, stateData) => {
        goStateName = stateName;
        goStateData = stateData;
      });

      describe('with a cloudberry device', () => {

        beforeEach(() => {
          $stateParams = { currentPlace: { displayName: deviceName, type: 'cloudberry', cisUuid: 'sa0va9u02' } };
          controller = initController($stateParams, $scope, $state);
          controller.showATA = showATA;
          controller.csdmHybridCallFeature = showHybrid;
        });

        it('should supply ShowActivationCodeCtrl with all the prerequisites', () => {
          controller.$onInit();
          controller.onGenerateOtpFn();
          $scope.$apply();

          expect($state.go).toHaveBeenCalled();
          expect(goStateData.wizard).toBeDefined();
          let wizardData = goStateData.wizard.state();
          expect(wizardData).toEqual(//jasmine.anything()
            {
              data: {
                function: 'showCode',
                showATA: true,
                csdmHybridCallFeature: true,
                adminOrganizationId: adminOrgId,
                account: { type: 'sharede', deviceType: 'cloudberry', cisUuid: placeCisUuid, name: deviceName, organizationId: orgId },
                recipient: { cisUuid: userCisUuid, organizationId: orgId, displayName: displayName, email: email },
                title: 'addDeviceWizard.newCode',
              },
              history: jasmine.anything(),
              currentStateName: jasmine.anything(),
              wizardState: jasmine.anything(),

            }
          );
        });
      });

      describe('with a huron device', () => {

        beforeEach(() => {
          $stateParams = { currentPlace: { displayName: deviceName, type: 'huron', cisUuid: 'sa0va9u02' } };
          controller = initController($stateParams, $scope, $state);
          controller.adminDisplayName = displayName;
          controller.showATA = showATA;
          controller.csdmHybridCallFeature = showHybrid;
        });

        it('should supply ShowActivationCodeCtrl with all the prerequisites', () => {
          controller.$onInit();
          controller.onGenerateOtpFn();
          $scope.$apply();

          expect($state.go).toHaveBeenCalled();
          expect(goStateData.wizard).toBeDefined();
          let wizardData = goStateData.wizard.state();
          expect(wizardData).toEqual(//jasmine.anything()
            {
              data: {
                function: 'showCode',
                showATA: true,
                csdmHybridCallFeature: true,
                adminOrganizationId: adminOrgId,
                account: { type: 'shared', deviceType: 'huron', cisUuid: placeCisUuid, organizationId: orgId, name: deviceName },
                recipient: { cisUuid: userCisUuid, organizationId: orgId, displayName: displayName, email: email },
                title: 'addDeviceWizard.newCode',
              },
              history: jasmine.anything(),
              currentStateName: jasmine.anything(),
              wizardState: jasmine.anything(),

            }
          );
        });
      });
    });
  });

  describe('invoke editCloudberryServices', () => {
    let goStateName, goStateData;
    let showATA, showHybrid, currentDevice, deviceName, displayName, email, userCisUuid, orgId, entitlements, placeUuid;
    beforeEach(() => {
      showATA = true;
      showHybrid = true;
      deviceName = 'deviceName';
      displayName = 'displayName';
      email = 'email@address.com';
      userCisUuid = 'userCisUuid';
      orgId = 'orgId';
      currentDevice = {
        displayName: deviceName,
      };
      entitlements = ['entitlement'];
      placeUuid = '9avs8y9q2v9aw98';

      spyOn(FeatureToggleService, 'csdmPstnGetStatus').and.returnValue($q.when(false));
      spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.when(showATA));
      spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.when(showHybrid));
      spyOn(Userservice, 'getUser').and.returnValue($q.when({}));
      spyOn($state, 'go').and.callFake((stateName, stateData) => {
        goStateName = stateName;
        goStateData = stateData;
      });

      $stateParams = {
        currentPlace: {
          displayName: deviceName,
          type: 'cloudberry',
          cisUuid: placeUuid,
          entitlements: entitlements,
        },
      };
      controller = initController($stateParams, $scope, $state);
    });

    it('should supply addDeviceFlow.editCloudberryServices with all the prereq', () => {
      controller.$onInit();
      controller.editCloudberryServices();
      $scope.$apply();

      expect($state.go).toHaveBeenCalled();
      expect(goStateData.wizard).toBeDefined();
      let wizardData = goStateData.wizard.state();
      expect(wizardData).toEqual(
        {
          data: {
            function: 'editServices',
            title: 'usersPreview.editServices',
            account: {
              deviceType: 'cloudberry',
              type: 'shared',
              name: deviceName,
              cisUuid: placeUuid,
              entitlements: jasmine.anything(),
            },
          },
          history: jasmine.anything(),
          currentStateName: jasmine.anything(),
          wizardState: jasmine.anything(),
        }
      );
    });
  });
});
