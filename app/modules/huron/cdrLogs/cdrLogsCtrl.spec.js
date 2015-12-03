'use strict';

describe('Controller: CdrLogsCtrl', function () {
  beforeEach(module('uc.cdrlogsupport'));
  beforeEach(module('Huron'));

  var controller, state, translate, timeout, Config, formlyValidationMessages, formlyConfig, CdrService, Notification;
  var callLegs = getJSONFixture('huron/json/cdrLogs/callLegs.json');
  var statusResponse = ['primary', 'danger'];

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$state_, _$translate_, _$timeout_, _Config_, _formlyValidationMessages_, _formlyConfig_, _CdrService_, _Notification_) {
    var $scope = $rootScope.$new();
    state = _$state_;
    translate = _$translate_;
    timeout = _$timeout_;
    Config = _Config_;
    formlyConfig = _formlyConfig_;
    formlyValidationMessages = _formlyValidationMessages_;
    CdrService = _CdrService_;
    Notification = _Notification_;

    var $q = _$q_;

    spyOn(state, "go");

    controller = $controller('CdrLogsCtrl', {
      $scope: $scope,
      $state: state,
      $translate: translate,
      $timeout: timeout,
      Config: Config,
      formlyConfig: formlyConfig,
      formlyValidationMessages: formlyValidationMessages,
      CdrService: CdrService,
      Notification: Notification
    });

    $scope.$apply();
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
    expect(controller.fields).toBeDefined();
  });

  it('statusAvalibility should return expected results for error codes', function () {
    expect(controller.statusAvalibility(callLegs[0])).toEqual(statusResponse[0]);
    expect(controller.statusAvalibility(callLegs[1])).toEqual(statusResponse[1]);
  });

  it('getAccordionHeader should return the correct title', function () {
    expect(controller.getAccordionHeader(callLegs[0])).toContain('cdrLogs.cdrAccordionHeader');
    expect(controller.getAccordionHeader(callLegs[0])).toContain('cdrLogs.sparkCall');
    expect(controller.getAccordionHeader(callLegs[1])).toContain('cdrLogs.cdrAccordionHeader');
    expect(controller.getAccordionHeader(callLegs[1])).not.toContain('cdrLogs.sparkCall');
  });

  it('selectCDR should set selectedCDR', function () {
    controller.selectCDR(callLegs[0][0][0], callLegs[0]);
    expect(controller.selectedCDR).toEqual(callLegs[0][0][0]);
  });
});
