  'use strict';

  describe('AddResourceControllerClusterViewV2', function () {
    beforeEach(angular.mock.module('Mediafusion'));
    var redirectTargetPromise, $q, $window, httpBackend, controller, $state, $stateParams, AddResourceCommonServiceV2, Notification, $translate;
    beforeEach(inject(function (_Notification_, _$translate_, _$window_, _$stateParams_, _AddResourceCommonServiceV2_, $httpBackend, $controller, _$q_) {
      $q = _$q_;
      httpBackend = $httpBackend;
      httpBackend.when('GET', /^\w+.*/).respond({});
      redirectTargetPromise = {
        then: sinon.stub()
      };
      $state = {
        'params': {
          'wizard': {},
          'firstTimeSetup': false,
          'yesProceed': true,
          'fromClusters': true
        },
        'modal': {
          close: sinon.stub()
        }
      };
      $stateParams = _$stateParams_;
      $window = _$window_;
      AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
      $translate = _$translate_;
      Notification = _Notification_;
      controller = $controller('AddResourceControllerClusterViewV2', {
        $q: $q,
        Notification: Notification,
        $translate: $translate,
        $state: $state,
        $stateParams: $stateParams,
        AddResourceCommonServiceV2: AddResourceCommonServiceV2,
      });
    }));
    it('controller should be defined', function () {
      expect(controller).toBeDefined();
    });

    it('AddResourceCommonServiceV2.redirectPopUpAndClose should be called for redirectToTargetAndCloseWindowClicked', function () {
      spyOn(AddResourceCommonServiceV2, 'addRedirectTargetClicked').and.returnValue($q.when());
      spyOn(AddResourceCommonServiceV2, 'redirectPopUpAndClose').and.returnValue(redirectTargetPromise);
      controller.redirectToTargetAndCloseWindowClicked();
      httpBackend.flush();
      expect(AddResourceCommonServiceV2.addRedirectTargetClicked).toHaveBeenCalled();
      expect(AddResourceCommonServiceV2.redirectPopUpAndClose).toHaveBeenCalled();
    });

    it('controller.enableRedirectToTarget should be true for next', function () {
      controller.selectedCluster = 'selectedCluster';
      controller.hostName = 'hostName';
      controller.next();
      expect(controller.enableRedirectToTarget).toBe(true);
    });

    it('AddResourceControllerClusterViewV2 canGoNext should disable the next button when the feild is empty', function () {
      controller.hosts = [{
        "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
        "hostname": "10.196.5.251",
        "hostSerial": "ac43493e-3f11-4eaa-aec0-f16f2a69969a"
      }];
      controller.canGoNext();
      expect(controller.canGoNext()).toBeFalsy();
    });

    it('AddResourceControllerClusterViewV2 canGoNext should enable the next button when firstTimeSetup is true and yesProceed is false', function () {
      controller.firstTimeSetup = true;
      controller.yesProceed = false;
      controller.canGoNext();
      expect(controller.canGoNext()).toBeTruthy();
    });

    it('AddResourceControllerClusterViewV2 canGoNext should enable the next button when the feild is filled', function () {
      controller.firstTimeSetup = true;
      controller.yesProceed = true;
      controller.hostName = "sampleHost";
      controller.selectedCluster = "sampleCluster";
      controller.canGoNext();
      expect(controller.canGoNext()).toBeTruthy();
    });

    it('controller.enableRedirectToTarget should be true for next()', function () {
      controller.selectedCluster = 'selectedCluster';
      controller.hostName = 'hostName';
      controller.next();
      expect(controller.enableRedirectToTarget).toBe(true);
    });
    it('controller.noProceed should be true for next()', function () {
      spyOn($window, 'open');
      controller.radio = 0;
      controller.noProceed = false;
      controller.next();
      expect(controller.noProceed).toBe(true);
    });

  });
