'use strict';

describe('Controller: ServiceSetup', function () {
  var controller, $scope, $state, $q, $httpBackend, ServiceSetup, Notification, HuronCustomer, DialPlanService;
  var model, customer, voicemail, externalNumberPool, usertemplate, form, timeZone, ExternalNumberService, ModalService, modalDefer;

  var dialPlanDetailsNorthAmerica = [{
    countryCode: "+1",
    extensionGenerated: "false",
    steeringDigitRequired: "true",
    supportSiteCode: "true",
    supportSiteSteeringDigit: "true"
  }];

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _ServiceSetup_, _Notification_,
    _HuronCustomer_, _DialPlanService_, _ExternalNumberService_, _ModalService_) {
    $scope = $rootScope.$new();
    // $state = _$state_;
    $q = _$q_;
    ServiceSetup = _ServiceSetup_;
    Notification = _Notification_;
    HuronCustomer = _HuronCustomer_;
    DialPlanService = _DialPlanService_;
    ExternalNumberService = _ExternalNumberService_;
    ModalService = _ModalService_;
    modalDefer = $q.defer();

    customer = {
      "uuid": "84562afa-2f35-474f-ba0f-2def42864e12",
      "name": "Atlas_Test_JP650",
      "servicePackage": "DEMO_STANDARD",
      "links": [{
        "rel": "common",
        "href": "/api/v1/common/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }, {
        "rel": "voicemail",
        "href": "/api/v1/voicemail/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }, {
        "rel": "voice",
        "href": "/api/v1/voice/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }]
    };
    model = {
      site: {
        uuid: '777-888-666',
        steeringDigit: '5',
        siteSteeringDigit: '6',
        siteCode: '200',
        voicemailPilotNumber: "+16506679080",
        timeZone: {
          value: 'America/Los_Angeles',
          label: '(GMT-08:00) Pacific Time (US & Canada)',
          timezoneid: '4'
        }
      },
      numberRanges: [{
        beginNumber: '5000',
        endNumber: '5999',
        uuid: '555-666-777'
      }, {
        beginNumber: '6000',
        endNumber: '6999'
      }, {
        beginNumber: '4000',
        endNumber: '4000'
      }]
    };
    timeZone = [{
      value: 'America/Los_Angeles',
      label: '(GMT-08:00) Pacific Time (US & Canada)',
      timezoneid: '4'
    }];
    voicemail = {
      name: "Simon",
      pilotNumber: "+16506679080",
      label: "(650) 667-9080"
    };
    usertemplate = [{
      timeZone: '4',
      alias: '1',
      objectId: 'fd87d99c-98a4-45db-af59-ebb9a6f18fdd'
    }];
    externalNumberPool = [{
      directoryNumber: null,
      pattern: "+14084744518",
      uuid: 'c0d5c7d8-306a-48db-af93-3cba6d433db0'
    }];

    $state = {
      current: {
        data: {
          firstTimeSetup: false
        }
      }
    };

    form = {
      '$invalid': false
    };

    spyOn(ServiceSetup, 'createInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'deleteInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'listSites').and.callFake(function () {
      ServiceSetup.sites = [model.site];
      return $q.when();
    });
    spyOn(ServiceSetup, 'createSite').and.returnValue($q.when());
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(model.site));
    spyOn(ServiceSetup, 'updateSite').and.returnValue($q.when());

    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
    spyOn(ServiceSetup, 'listVoicemailTimezone').and.returnValue($q.when(usertemplate));
    spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemail));
    spyOn(ServiceSetup, 'loadExternalNumberPool').and.returnValue($q.when(externalNumberPool));
    spyOn(ServiceSetup, 'updateCustomer').and.returnValue($q.when());
    spyOn(ServiceSetup, 'updateVoicemailTimezone').and.returnValue($q.when());
    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.when());

    spyOn(ServiceSetup, 'listInternalNumberRanges').and.callFake(function () {
      ServiceSetup.internalNumberRanges = model.numberRanges;
      return $q.when();
    });

    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.when(timeZone));
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when(dialPlanDetailsNorthAmerica));
    spyOn(ModalService, 'open').and.returnValue({
      result: modalDefer.promise
    });

    controller = $controller('ServiceSetupCtrl', {
      $scope: $scope,
      $state: $state,
      ServiceSetup: ServiceSetup
    });

    controller.form = form;
    $scope.$apply();
  }));

  it('should have customer service info', function () {
    expect(controller.hasVoicemailService).toEqual(true);
  });

  it('should have internal number ranges', function () {
    expect(controller.model.numberRanges).toEqual(model.numberRanges);
  });

  describe('deleteInternalNumberRange', function () {

    it('should remove from list and notify success', function () {
      var index = 0;
      var internalNumberRange = model.numberRanges[index];
      controller.deleteInternalNumberRange(model.numberRanges[0]);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      expect(controller.model.numberRanges).not.toContain(internalNumberRange);
    });

    it('should remove from list and not notify', function () {
      var index = 1;
      var internalNumberRange = model.numberRanges[index];
      controller.deleteInternalNumberRange(internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).not.toHaveBeenCalled();
      expect(Notification.notify).not.toHaveBeenCalled();
      expect(controller.model.numberRanges).not.toContain(internalNumberRange);
    });

    it('should remove singleNumberRange and not notify', function () {
      var index = 2;
      var internalNumberRange = model.numberRanges[index];
      controller.deleteInternalNumberRange(internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).not.toHaveBeenCalled();
      expect(Notification.notify).not.toHaveBeenCalled();
      expect(controller.model.numberRanges).not.toContain(internalNumberRange);
    });

    it('should notify error on error', function () {
      ServiceSetup.deleteInternalNumberRange.and.returnValue($q.reject());

      var index = 0;
      var internalNumberRange = model.numberRanges[index];
      controller.deleteInternalNumberRange(internalNumberRange);
      $scope.$apply();

      expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect(controller.model.numberRanges).toContain(internalNumberRange);
    });
  });

  describe('initNext', function () {

    it('customer with voicemail service should create site', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer with voicemail should not disable if user cancels voicemail modal warning', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);

      modalDefer.reject();
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer with voicemail service should not create site when update customer fails', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      ServiceSetup.updateCustomer.and.returnValue($q.reject());
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).not.toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('customer with voicemail service should not create site when create site fails', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      ServiceSetup.createSite.and.returnValue($q.reject());
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).toHaveBeenCalled();
      expect(controller.hasSites).toEqual(false);
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('customer with voicemail service should not update site when update site fails', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      ServiceSetup.updateSite.and.returnValue($q.reject());
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('customer with voicemail service should not update site when update customer fails', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      ServiceSetup.updateCustomer.and.returnValue($q.reject());
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('customer with voicemail service should not update site when update voicemail timezone fails', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;
      controller.model.site.timeZone = {
        value: 'bogus',
        timezoneid: '10'
      };

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      ServiceSetup.updateVoicemailTimezone.and.returnValue($q.reject());
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('customer with voicemail service should not update timezone when timezoneid is missing', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;
      controller.model.site.timeZone = {
        value: 'bogus'
      };

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      ServiceSetup.updateVoicemailTimezone.and.returnValue($q.reject());
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('customer with voicemail service should create site and change voicemail timezone', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;
      controller.model.site.timeZone = {
        value: 'bogus',
        timezoneid: '10'
      };

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer with voicemail service should not update customer or site on no change', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = voicemail.label;

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer with voicemail service should create voice only site', function () {
      controller.hasSites = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = undefined;
      controller.hasVoicemailService = true;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      modalDefer.resolve();
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.createSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer without voicemail should not disable voicemail', function () {
      controller.hasSites = true;
      controller.model.site.voicemailPilotNumber = undefined;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = false;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = undefined;
      controller.hasVoicemailService = false;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer without voicemail should update site when customer has pilot number misconfig', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = false;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer without voicemail should update site', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = false;

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('customer without voicemail should update site and change voicemail timezone', function () {
      var selectedPilotNumber = {};
      selectedPilotNumber.pattern = '(972) 896-5000';

      controller.hasSites = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
      controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
      controller.hasVoicemailService = false;
      controller.model.site.timeZone = {
        value: 'bogus',
        timezoneid: '10'
      };

      //remove singlenumber range for it to pass
      controller.deleteInternalNumberRange(model.numberRanges[2]);
      controller.initNext();
      $scope.$apply();

      expect(ServiceSetup.updateSite).toHaveBeenCalled();
      expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      expect(ModalService.open).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify error if createInternalNumberRange fails', function () {
      ServiceSetup.createInternalNumberRange.and.returnValue($q.reject());

      var promise = controller.initNext();
      $scope.$apply();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(promise.$$state.value).toEqual('Site/extension create failed.');
    });

    it('should call getCustomerDialPlanDetails()', function () {
      expect(DialPlanService.getCustomerDialPlanDetails).toHaveBeenCalled();
    });

    it('should call createInternalNumberRange() if hideFieldInternalNumberRange is false', function () {
      controller.hideFieldInternalNumberRange = false;
      var promise = controller.initNext();
      $scope.$apply();
      expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
    });

    it('should call not createInternalNumberRange() if hideFieldInternalNumberRange is true', function () {
      controller.hideFieldInternalNumberRange = true;
      var promise = controller.initNext();
      $scope.$apply();
      expect(ServiceSetup.createInternalNumberRange).not.toHaveBeenCalled();
    });
  });

  describe('setServiceValues', function () {
    it('should call DialPlanService()', function () {
      expect(DialPlanService.getCustomerDialPlanDetails).toHaveBeenCalled();
    });
  });

});
