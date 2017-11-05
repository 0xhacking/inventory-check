'use strict';

describe('RedirectAddResourceControllerV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var redirectTargetPromise, $q, httpBackend, controller, $state, $stateParams, AddResourceCommonServiceV2, Notification, $translate, $modalInstance, $modal, firstTimeSetup, yesProceed;
  var fakeModal = {
    result: {
      then: function (confirmCallback, cancelCallback) {
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function (item) {
      this.result.confirmCallBack(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    }
  };
  beforeEach(inject(function (_Notification_, _$translate_, _$state_, _$stateParams_, _AddResourceCommonServiceV2_, $httpBackend, $controller, _$q_, _$modal_) {
    $q = _$q_;
    httpBackend = $httpBackend;
    httpBackend.when('GET', /^\w+.*/).respond({});
    redirectTargetPromise = {
      then: sinon.stub()
    };
    $state = _$state_;
    $stateParams = _$stateParams_;
    AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
    $translate = _$translate_;
    Notification = _Notification_;
    $modalInstance = {
      close: sinon.stub()
    };
    $modal = _$modal_;
    yesProceed = true;
    firstTimeSetup = true;
    controller = $controller('RedirectAddResourceControllerV2', {
      $q: $q,
      Notification: Notification,
      $translate: $translate,
      $state: $state,
      $stateParams: $stateParams,
      AddResourceCommonServiceV2: AddResourceCommonServiceV2,
      $modalInstance: $modalInstance,
      $modal: $modal,
      yesProceed: yesProceed,
      firstTimeSetup: firstTimeSetup
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

  it('controller.enableRedirectToTarget should be true for next()', function () {
    controller.selectedCluster = 'selectedCluster';
    controller.hostName = 'hostName';
    controller.next();
    expect(controller.enableRedirectToTarget).toBe(true);
  });
  it('controller.noProceed should be true for next()', function () {
    controller.radio = 0;
    controller.noProceed = false;
    controller.next();
    expect(controller.noProceed).toBe(true);
  });
  it('RedirectAddResourceControllerV2 closeSetupModal should close the modal', function () {
    spyOn($state, 'go');
    controller.closeSetupModal(true);
    expect($modalInstance.close).toHaveBeenCalled();
  });
  xit('RedirectAddResourceControllerV2 closeSetupModal should close the modal when firstTimeSetup is false', function () {
    spyOn($modalInstance, "close");
    firstTimeSetup = false;
    controller.closeSetupModal(false);
    expect($modalInstance.close).toHaveBeenCalled();
  });
  it('RedirectAddResourceControllerV2 closeSetupModal should open the confirm-setup-cancel dialog', function () {
    spyOn($state, 'go');
    spyOn($modal, 'open').and.returnValue(fakeModal);
    controller.firstTimeSetup = true;
    controller.closeSetupModal(false);
    expect($modal.open).toHaveBeenCalled();
  });
  it('RedirectAddResourceControllerV2 back should set the enableRedirectToTarget false', function () {
    controller.back();
    expect(controller.enableRedirectToTarget).toBeFalsy();
  });
  it('RedirectAddResourceControllerV2 canGoNext should disable the next button when the feild is empty', function () {
    controller.hosts = [{
      "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
      "hostname": "10.196.5.251",
      "hostSerial": "ac43493e-3f11-4eaa-aec0-f16f2a69969a"
    }];
    controller.canGoNext();
    expect(controller.canGoNext()).toBeFalsy();
  });
  it('RedirectAddResourceControllerV2 canGoNext should enable the next button when firstTimeSetup is true and yesProceed is false', function () {
    controller.firstTimeSetup = true;
    controller.yesProceed = false;
    controller.canGoNext();
    expect(controller.canGoNext()).toBeTruthy();
  });
  it('RedirectAddResourceControllerV2 canGoNext should enable the next button when the feild is filled', function () {
    controller.firstTimeSetup = true;
    controller.yesProceed = true;
    controller.hostName = "sampleHost";
    controller.selectedCluster = "sampleCluster";
    controller.canGoNext();
    expect(controller.canGoNext()).toBeTruthy();
  });
});
