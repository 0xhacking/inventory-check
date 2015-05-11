'use strict';

describe('Controller: TrialAddCtrl', function () {
  var controller, $scope, $q, $translate, $state, Notification, TrialService, HuronCustomer, EmailService;

  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _$state_, _Notification_, _TrialService_, _HuronCustomer_, _EmailService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $state = _$state_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    HuronCustomer = _HuronCustomer_;
    EmailService = _EmailService_;

    spyOn(Notification, 'notify');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');
    spyOn(EmailService, 'emailNotifyTrialCustomer').and.returnValue($q.when());

    controller = $controller('TrialAddCtrl', {
      $scope: $scope,
      $translate: $translate,
      $state: $state,
      TrialService: TrialService,
      HuronCustomer: HuronCustomer,
      Notification: Notification,
      EmailService: _EmailService_
    });
    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should have empty offers', function () {
    expect(controller.isOffersEmpty()).toBeTruthy();
  });

  it('should transition state', function () {
    controller.gotoAddNumber();
    expect($state.go).toHaveBeenCalledWith('trialAdd.addNumbers');
  });

  describe('Start a new trial', function () {
    beforeEach(function () {
      spyOn(TrialService, "startTrial").and.returnValue($q.when(getJSONFixture('core/json/trials/trialAddResponse.json')));
    });

    describe('With optional flag', function () {
      beforeEach(function () {
        controller.startTrial(true);
        $scope.$apply();
      });

      it('should notify success', function () {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should not have closed the modal', function () {
        expect($state.modal.close).not.toHaveBeenCalled();
      });

      it('should send an email', function () {
        expect(EmailService.emailNotifyTrialCustomer).toHaveBeenCalled();
      });
    });

    describe('Without optional flag', function () {
      beforeEach(function () {
        controller.startTrial();
        $scope.$apply();
      });

      it('should notify success', function () {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should close the modal', function () {
        expect($state.modal.close).toHaveBeenCalled();
      });
    });

    describe('With Squared UC', function () {
      beforeEach(function () {
        controller.offers = {
          COLLAB: true,
          SQUAREDUC: true
        };
      });

      it('should not have empty offers', function () {
        expect(controller.isOffersEmpty()).toBeFalsy();
      });

      it('should have Squared UC offer', function () {
        expect(controller.isSquaredUCEnabled()).toBeTruthy();
      });

      it('should notify success', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.when());
        controller.startTrial();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
        expect(Notification.notify.calls.count()).toEqual(1);
        expect(EmailService.emailNotifyTrialCustomer).not.toHaveBeenCalled();
      });

      it('error should notify error', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.reject());
        controller.startTrial();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        expect(Notification.notify.calls.count()).toEqual(1);
      });
    });
  });

  describe('Start a new trial with error', function () {
    var startTrialSpy;
    beforeEach(function () {
      startTrialSpy = spyOn(TrialService, "startTrial").and.returnValue($q.reject({
        data: {
          message: 'An error occurred'
        }
      }));
      controller.startTrial();
      $scope.$apply();
    });

    it('should notify error', function () {
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should not have closed the modal', function () {
      expect($state.modal.close).not.toHaveBeenCalled();
    });

    it('should show a name error', function () {
      startTrialSpy.and.returnValue($q.reject({
        data: {
          message: 'Org'
        }
      }));
      controller.startTrial();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should show an email error', function () {
      startTrialSpy.and.returnValue($q.reject({
        data: {
          message: 'Admin User'
        }
      }));
      controller.startTrial();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });
});
