'use strict';

describe('Controller: TrialNoticeBannerCtrl:', function () {
  var $scope,
    controller,
    $httpBackend,
    $q,
    Authinfo,
    EmailService,
    FeatureToggleService,
    Notification,
    TrialService,
    UserListService;

  var fakePartnerInfoData = {
    'data': {
      'partners': [{
        'userName': 'fake-partner-email@example.com',
        'displayName': 'fakeuser admin1',
      }]
    }
  };

  var fakeTrialPeriodData = {
    startDate: '2015-12-06T00:00:00.000Z',
    trialPeriod: 90
  };

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  /* @ngInject */
  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _$q_, _Authinfo_, _EmailService_,
    _FeatureToggleService_, _Notification_, _TrialService_, _UserListService_) {

    $scope = $rootScope.$new();
    controller = $controller;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    EmailService = _EmailService_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    UserListService = _UserListService_;

    spyOn(Notification, 'success');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(UserListService, 'listPartnersAsPromise').and.returnValue($q.when(fakePartnerInfoData));
    $httpBackend.whenGET(/organization\/trials$/).respond(fakeTrialPeriodData);

    controller = controller('TrialNoticeBannerCtrl', {
      $q: $q,
      Authinfo: Authinfo,
      EmailService: EmailService,
      FeatureToggleService: FeatureToggleService,
      Notification: Notification,
      TrialService: TrialService,
      UserListService: UserListService
    });

    $httpBackend.flush();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors:', function () {
    it('should check if "atlasTrialConversion" feature-toggle is enabled', function () {
      expect(FeatureToggleService.supports)
        .toHaveBeenCalledWith(FeatureToggleService.features.atlasTrialConversion);
    });

    it('should set "daysLeft"', function () {
      // no mechanism to mock current day, to guarantee a consistent period, so just check null
      expect(controller.daysLeft).not.toBeNull();
    });

    it('should set "partnerAdminEmail"', function () {
      expect(controller.partnerAdminEmail).toBe('fake-partner-email@example.com');
    });

    it('should set "partnerAdminDisplayName"', function () {
      expect(controller.partnerAdminDisplayName).toBe('fakeuser admin1');
    });

    describe('canShow():', function () {
      describe('if "atlasTrialConversion" feature-toggle is enabled:', function () {
        it('should return true if "Authinfo.isUserAdmin()" is true and "TrialInfo.getTrialIds()" is not empty', function () {
          spyOn(TrialService, 'getTrialIds').and.returnValue(['fake-uuid-value-1']);
          spyOn(Authinfo, 'isUserAdmin').and.returnValue(true);
          expect(controller.canShow()).toBe(true);
        });

        it('should return true if "Authinfo.isUserAdmin()" is false', function () {
          spyOn(Authinfo, 'isUserAdmin').and.returnValue(false);
          expect(controller.canShow()).toBe(false);
        });
      });
    });

    describe('sendRequest():', function () {
      it('should have called "sendEmail()"', function () {
        spyOn(controller._helpers, 'sendEmail').and.returnValue($q.when());

        controller.sendRequest().then(function () {
          expect(controller._helpers.sendEmail).toHaveBeenCalled();
          expect(Notification.success).toHaveBeenCalled();
          expect(controller.hasRequested).toBe(true);
        });
      });
    });
  });

  describe('helper functions:', function () {
    describe('getDaysLeft():', function () {
      var getDaysLeft;

      beforeEach(function () {
        getDaysLeft = controller._helpers.getDaysLeft;
        spyOn(TrialService, 'getTrialIds').and.returnValue(['fake-uuid-value-1']);
        spyOn(TrialService, 'getExpirationPeriod').and.returnValue($q.when(1));
        spyOn(TrialService, 'getTrialPeriodData').and.returnValue($q.when(fakeTrialPeriodData));
      });

      it('should resolve with the return value from "TrialService.getExpirationPeriod()"', function () {
        getDaysLeft().then(function (daysLeft) {
          expect(daysLeft).toBe(1);
        });
      });

      it('should have called "TrialService.getTrialIds()"', function () {
        getDaysLeft().then(function (daysLeft) {
          expect(TrialService.getTrialIds).toHaveBeenCalled();
        });
      });

      it('should have called "TrialService.getExpirationPeriod()" with the return value of "TrialService.getTrialIds()"', function () {
        getDaysLeft().then(function (daysLeft) {
          expect(TrialService.getExpirationPeriod).toHaveBeenCalledWith(['fake-uuid-value-1']);
        });
      });
    });

    describe('getPrimaryPartnerInfo():', function () {
      describe('will resolve with partner data that...', function () {
        it('should have a "data.partners[0].displayName" property', function () {
          controller._helpers.getPrimaryPartnerInfo().then(function (partnerInfo) {
            expect(partnerInfo.data.partners[0].displayName).toBe('fakeuser admin1');
          });
        });
      });
    });

    describe('sendEmail():', function () {
      it('should have called "EmailService.emailNotifyPartnerTrialConversionRequest()"', function () {
        spyOn(Authinfo, 'getOrgName').and.returnValue('fake-cust-name');
        spyOn(Authinfo, 'getPrimaryEmail').and.returnValue('fake-cust-admin-email');
        controller.partnerAdminEmail = 'fake-partner-admin-email';
        spyOn(EmailService, 'emailNotifyPartnerTrialConversionRequest');

        controller._helpers.sendEmail();
        expect(EmailService.emailNotifyPartnerTrialConversionRequest)
          .toHaveBeenCalledWith(
            'fake-cust-name', 'fake-cust-admin-email', 'fake-partner-admin-email');
      });
    });
  });
});
