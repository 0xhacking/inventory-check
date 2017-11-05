'use strict';

describe('Controller: MediaServiceSettingsControllerV2', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  var controller, httpMock, $q, $modal, redirectTargetPromise;
  var ServiceDescriptor, MailValidatorService, Notification;

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));
  beforeEach(inject(function ($state, _$httpBackend_, $controller, $stateParams, _$q_, _$modal_, $translate, _MailValidatorService_, _Notification_, _ServiceDescriptor_) {
    $q = _$q_;
    $modal = _$modal_;
    httpMock = _$httpBackend_;

    MailValidatorService = _MailValidatorService_;
    Notification = _Notification_;
    ServiceDescriptor = _ServiceDescriptor_;
    redirectTargetPromise = {
      then: sinon.stub()
    };
    sinon.stub(ServiceDescriptor, 'getEmailSubscribers');
    ServiceDescriptor.getEmailSubscribers.returns(redirectTargetPromise);
    sinon.stub($state, 'go');
    httpMock.when('GET', /^\w+.*/).respond({});
    controller = $controller('MediaServiceSettingsControllerV2', {
      $state: $state,
      $stateParams: $stateParams,
      $q: $q,
      $modal: $modal,
      $translate: $translate,
      httpMock: httpMock,

      MailValidatorService: MailValidatorService,
      Notification: Notification,
      ServiceDescriptor: ServiceDescriptor
    });

  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('writeConfig should notify success for valid emailSubscribers', function () {
    httpMock.when('PATCH', /^\w+.*/).respond(204, null);
    var emails = [{
      "text": "abc@cisco.com"
    }];
    controller.serviceId = "squared-fusion-media";
    controller.emailSubscribers = emails;
    spyOn(Notification, 'success');
    spyOn(ServiceDescriptor, 'setEmailSubscribers').and.callThrough();
    controller.writeConfig();
    httpMock.flush();
    expect(Notification.success).toHaveBeenCalled();
    expect(controller.savingEmail).toBeFalsy();
    expect(ServiceDescriptor.setEmailSubscribers).toHaveBeenCalled();
  });
  it('writeConfig should notify error for invalid emailSubscribers', function () {
    var emails = [{
      "text": "abc"
    }];
    spyOn(Notification, 'error');
    controller.serviceId = "squared-fusion-media";
    controller.emailSubscribers = emails;
    controller.writeConfig();
    expect(Notification.error).toHaveBeenCalled();
  });
  it('confirmDisable should open the respective modal', function () {
    spyOn($modal, 'open');
    controller.confirmDisable();
    expect($modal.open).toHaveBeenCalled();
  });
});
