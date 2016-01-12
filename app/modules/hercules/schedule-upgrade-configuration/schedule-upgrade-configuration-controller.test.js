'use strict';

describe('Directive Controller: ScheduleUpgradeConfigurationCtrl', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var vm, $rootScope, $httpBackend, Authinfo, ScheduleUpgradeService, NotificationService;

  var UIDataFixture = {
    scheduleTime: '03:00',
    scheduleTimeZone: 'America/New_York',
    scheduleDay: {
      label: 'Every Monday',
      value: 1
    }
  };

  var serverDataFixture = {
    scheduleTime: '03:00',
    scheduleTimeZone: 'America/New_York',
    scheduleDay: 1,
    isAdminAcknowledged: false
  };

  beforeEach(module(function ($provide) {
    Authinfo = {
      getOrgId: sinon.stub().returns('dead-beef-123')
    };
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $q, $controller, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;

    ScheduleUpgradeService = {
      get: sinon.stub().returns($q.when(angular.copy(serverDataFixture))),
      patch: sinon.stub().returns($q.when(angular.extend({
        isAdminAcknowledged: true
      }, angular.copy(serverDataFixture))))
    };

    NotificationService = {
      removeNotification: sinon.stub()
    };

    vm = $controller('ScheduleUpgradeConfigurationCtrl', {
      $scope: $rootScope.$new(),
      Authinfo: Authinfo,
      ScheduleUpgradeService: ScheduleUpgradeService,
      NotificationService: NotificationService
    });

    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should start in the syncing state', function () {
    expect(vm.state === 'syncing').toBe(true);
  });

  it('should start with no error message', function () {
    expect(vm.errorMessage === '').toBe(true);
  });

  it('should have all the 24 time options', function () {
    var timeOptions = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    expect(vm.timeOptions).toEqual(timeOptions);
  });

  it('should have all the 7 day options', function () {
    var valueOptions = [1, 2, 3, 4, 5, 6, 7];
    expect(vm.dayOptions.length).toEqual(7);
    expect(vm.dayOptions.map(function (option) {
      return option.value;
    })).toEqual(valueOptions);
  });

  it('should have many timezone options', function () {
    expect(vm.timezoneOptions.length > 20).toBe(true);
  });

  it('should have called ScheduleUpgradeService.get', function () {
    expect(ScheduleUpgradeService.get.calledOnce).toBe(true);
  });

  it('should have called ScheduleUpgradeService.patch when acknowledging', function () {
    expect(ScheduleUpgradeService.patch.called).toBe(false);
    var data = angular.copy(UIDataFixture);
    vm.acknowledge(data);
    $rootScope.$digest();
    expect(ScheduleUpgradeService.patch.calledOnce).toBe(true);
  });

  it('should have called ScheduleUpgradeService.patch when UI data changed', function () {
    expect(ScheduleUpgradeService.patch.called).toBe(false);
    // let's pretend the first time is from the API
    vm.data = angular.copy(UIDataFixture);
    $rootScope.$digest();
    // and now it's because the user changed it
    vm.data.scheduleTime = '04:00';
    $rootScope.$digest();
    expect(ScheduleUpgradeService.patch.calledOnce).toBe(true);
  });

  it('should have called NotificationService.removeNotification when patch got called', function () {
    var data = angular.copy(UIDataFixture);
    vm.acknowledge(data);
    $rootScope.$digest();
    // patch has been trigerred
    expect(NotificationService.removeNotification.calledOnce).toBe(true);
    expect(NotificationService.removeNotification.calledWith('acknowledgeScheduleUpgrade')).toBe(true);
  });
});
