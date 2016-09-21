'use strict';

describe('Controller: Customer Reports Ctrl', function () {
  var controller, $scope, $state, $stateParams, $q, $translate, $timeout, Authinfo, Log, Config, CustomerReportService, DummyCustomerReportService, CustomerGraphService, WebexReportService, WebExApiGatewayService, Userservice, FeatureToggleService, MediaServiceActivationV2;
  var activeUsersSort = ['userName', 'numCalls', 'sparkMessages', 'totalActivity'];
  var REFRESH = 'refresh';

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  var responseActiveData = activeData.activeResponse;
  var responseMostActiveData = activeData.mostActiveResponse;
  var roomData = getJSONFixture('core/json/customerReports/roomData.json');
  var fileData = getJSONFixture('core/json/customerReports/fileData.json');
  var mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  var metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  var dummyMetrics = angular.copy(metricsData);
  dummyMetrics.dummy = true;
  var devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  var deviceResponse = angular.copy(devicesJson.response);
  var dummyDevices = angular.copy(devicesJson.dummyData);

  var mediaOptions = [{
    value: 0,
    label: 'reportsPage.allCalls'
  }, {
    value: 1,
    label: 'reportsPage.audioCalls'
  }, {
    value: 2,
    label: 'reportsPage.videoCalls'
  }];

  var defaultDeviceFilter = {
    value: 0,
    label: 'registeredEndpoints.allDevices'
  };

  var headerTabs = [{
    title: 'mediaFusion.page_title',
    state: 'reports-metrics'
  }, {
    title: 'reportsPage.sparkReports',
    state: 'reports'
  }, {
    title: 'reportsPage.careTab',
    state: 'reports.care'
  }];
  var timeOptions = [{
    value: 0,
    label: 'reportsPage.week',
    description: 'reportsPage.week2'
  }, {
    value: 1,
    label: 'reportsPage.month',
    description: 'reportsPage.month2'
  }, {
    value: 2,
    label: 'reportsPage.threeMonths',
    description: 'reportsPage.threeMonths2'
  }];

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Mediafusion'));

  describe('CustomerReportsCtrl - Expected Responses', function () {
    beforeEach(inject(function ($rootScope, $controller, _$state_, _$stateParams_, _$q_, _$translate_, _$timeout_, _Authinfo_, _Log_, _Config_, _CustomerReportService_, _DummyCustomerReportService_, _CustomerGraphService_, _FeatureToggleService_, _MediaServiceActivationV2_) {
      $scope = $rootScope.$new();
      $state = _$state_;
      $stateParams = _$stateParams_;
      $q = _$q_;
      $translate = _$translate_;
      $timeout = _$timeout_;
      Authinfo = _Authinfo_;
      Log = _Log_;
      Config = _Config_;
      CustomerReportService = _CustomerReportService_;
      DummyCustomerReportService = _DummyCustomerReportService_;
      CustomerGraphService = _CustomerGraphService_;
      FeatureToggleService = _FeatureToggleService_;
      MediaServiceActivationV2 = _MediaServiceActivationV2_;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});
      spyOn(FeatureToggleService, 'atlasMediaServiceMetricsGetStatus').and.returnValue(
        $q.when(true)
      );
      spyOn(Authinfo, 'isCare').and.returnValue(true);
      spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(
        $q.when(true)
      );
      spyOn(MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(
        $q.resolve(true)
      );
      // Service Spies
      spyOn(CustomerGraphService, 'setActiveUsersGraph').and.returnValue({
        'dataProvider': dummyData.activeUser.one
      });
      spyOn(CustomerGraphService, 'setAvgRoomsGraph').and.returnValue({
        'dataProvider': roomData.response
      });
      spyOn(CustomerGraphService, 'setFilesSharedGraph').and.returnValue({
        'dataProvider': fileData.response
      });
      spyOn(CustomerGraphService, 'setMediaQualityGraph').and.returnValue({
        'dataProvider': mediaData.response
      });
      spyOn(CustomerGraphService, 'setMetricsGraph').and.returnValue({
        'dataProvider': metricsData.dataProvider
      });
      spyOn(CustomerGraphService, 'setDeviceGraph').and.returnValue({
        'dataProvider': deviceResponse.graphData
      });

      spyOn(DummyCustomerReportService, 'dummyActiveUserData').and.returnValue(dummyData.activeUser.one);
      spyOn(DummyCustomerReportService, 'dummyAvgRoomData').and.returnValue(dummyData.avgRooms.one);
      spyOn(DummyCustomerReportService, 'dummyFilesSharedData').and.returnValue(dummyData.filesShared.one);
      spyOn(DummyCustomerReportService, 'dummyMediaData').and.returnValue(dummyData.mediaQuality.one);
      spyOn(DummyCustomerReportService, 'dummyMetricsData').and.returnValue(dummyMetrics);
      spyOn(DummyCustomerReportService, 'dummyDeviceData').and.returnValue(dummyDevices);

      spyOn(CustomerReportService, 'getActiveUserData').and.returnValue($q.when(responseActiveData));
      spyOn(CustomerReportService, 'getMostActiveUserData').and.returnValue($q.when(responseMostActiveData));
      spyOn(CustomerReportService, 'getAvgRoomData').and.returnValue($q.when(roomData.response));
      spyOn(CustomerReportService, 'getFilesSharedData').and.returnValue($q.when(fileData.response));
      spyOn(CustomerReportService, 'getMediaQualityData').and.returnValue($q.when(mediaData.response));
      spyOn(CustomerReportService, 'getCallMetricsData').and.returnValue($q.when(metricsData));
      spyOn(CustomerReportService, 'getDeviceData').and.returnValue($q.when(deviceResponse));

      spyOn($state, 'go');

      // Webex Requirements
      WebexReportService = {
        initReportsObject: function () {}
      };

      WebExApiGatewayService = {
        siteFunctions: function (url) {
          var defer = $q.defer();
          defer.resolve({
            siteUrl: url
          });
          return defer.promise;
        }
      };

      Userservice = {
        getUser: function (user) {
          expect(user).toBe('me');
        }
      };

      controller = $controller('CustomerReportsCtrl', {
        $state: $state,
        $stateParams: $stateParams,
        $q: $q,
        $translate: $translate,
        Log: Log,
        Config: Config,
        CustomerReportService: CustomerReportService,
        DummyCustomerReportService: DummyCustomerReportService,
        CustomerGraphService: CustomerGraphService,
        WebexReportService: WebexReportService,
        WebExApiGatewayService: WebExApiGatewayService,
        Userservice: Userservice,
        FeatureToggleService: FeatureToggleService,
        MediaServiceActivationV2: MediaServiceActivationV2
      });

      $scope.$apply();
      $httpBackend.flush();
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Initializing Controller', function () {
      it('should be created successfully and all expected calls completed', function () {
        expect(controller).toBeDefined();
        $timeout(function () {
          expect(DummyCustomerReportService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[0], false);
          expect(DummyCustomerReportService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
          expect(DummyCustomerReportService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
          expect(DummyCustomerReportService.dummyMediaData).toHaveBeenCalledWith(timeOptions[0]);
          expect(DummyCustomerReportService.dummyMetricsData).toHaveBeenCalled();
          expect(DummyCustomerReportService.dummyDeviceData).toHaveBeenCalledWith(timeOptions[0]);

          expect(CustomerReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getMostActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getDeviceData).toHaveBeenCalledWith(timeOptions[0]);

          expect(CustomerGraphService.setActiveUsersGraph).toHaveBeenCalled();
          expect(CustomerGraphService.setAvgRoomsGraph).toHaveBeenCalled();
          expect(CustomerGraphService.setFilesSharedGraph).toHaveBeenCalled();
          expect(CustomerGraphService.setMediaQualityGraph).toHaveBeenCalled();
          expect(CustomerGraphService.setMetricsGraph).toHaveBeenCalled();
          expect(CustomerGraphService.setDeviceGraph).toHaveBeenCalled();
        }, 30);
      });

      it('should set all page variables', function () {
        expect(controller.showWebexTab).toBeFalsy();

        expect(controller.pageTitle).toEqual('reportsPage.pageTitle');
        expect(controller.allReports).toEqual('all');
        expect(controller.engagement).toEqual('engagement');
        expect(controller.quality).toEqual('quality');
        expect(controller.displayEngagement).toBeTruthy();
        expect(controller.displayQuality).toBeTruthy();

        expect(controller.activeUserStatus).toEqual(REFRESH);
        expect(controller.showMostActiveUsers).toBeFalsy();
        expect(controller.displayMostActive).toBeFalsy();
        expect(controller.mostActiveUsers).toEqual([]);
        expect(controller.searchField).toEqual('');
        expect(controller.activeUserReverse).toBeTruthy();
        expect(controller.activeUsersTotalPages).toEqual(0);
        expect(controller.activeUserCurrentPage).toEqual(0);
        expect(controller.activeUserPredicate).toEqual(activeUsersSort[3]);
        expect(controller.activeButton).toEqual([1, 2, 3]);

        expect(controller.avgRoomStatus).toEqual(REFRESH);
        expect(controller.filesSharedStatus).toEqual(REFRESH);
        expect(controller.metricStatus).toEqual(REFRESH);
        expect(controller.metrics).toEqual({});

        expect(controller.mediaQualityStatus).toEqual(REFRESH);
        expect(controller.mediaOptions).toEqual(mediaOptions);
        expect(controller.mediaSelected).toEqual(mediaOptions[0]);

        expect(controller.deviceStatus).toEqual(REFRESH);
        expect(controller.deviceFilter).toEqual([defaultDeviceFilter]);
        expect(controller.selectedDevice).toEqual(defaultDeviceFilter);

        expect(controller.headerTabs).toEqual(headerTabs);
        expect(controller.timeOptions).toEqual(timeOptions);
        expect(controller.timeSelected).toEqual(timeOptions[0]);
      });
    });

    describe('filter changes', function () {
      it('All graphs should update on time filter changes', function () {
        controller.timeSelected = timeOptions[1];
        controller.timeUpdate();
        expect(controller.timeSelected).toEqual(timeOptions[1]);

        expect(DummyCustomerReportService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[1], false);
        expect(DummyCustomerReportService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
        expect(DummyCustomerReportService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
        expect(DummyCustomerReportService.dummyMediaData).toHaveBeenCalledWith(timeOptions[1]);
        expect(DummyCustomerReportService.dummyMetricsData).toHaveBeenCalled();
        expect(DummyCustomerReportService.dummyDeviceData).toHaveBeenCalledWith(timeOptions[1]);

        expect(CustomerReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getDeviceData).toHaveBeenCalledWith(timeOptions[1]);

        expect(CustomerGraphService.setActiveUsersGraph).toHaveBeenCalled();
        expect(CustomerGraphService.setAvgRoomsGraph).toHaveBeenCalled();
        expect(CustomerGraphService.setFilesSharedGraph).toHaveBeenCalled();
        expect(CustomerGraphService.setMediaQualityGraph).toHaveBeenCalled();
        expect(CustomerGraphService.setMetricsGraph).toHaveBeenCalled();
        expect(CustomerGraphService.setDeviceGraph).toHaveBeenCalled();
      });

      it('should update the media graph on mediaUpdate', function () {
        controller.timeSelected = timeOptions[2];
        controller.mediaUpdate();

        expect(CustomerGraphService.setMediaQualityGraph).toHaveBeenCalled();
        expect(CustomerGraphService.setActiveUsersGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setAvgRoomsGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setFilesSharedGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setMetricsGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setDeviceGraph).not.toHaveBeenCalled();
      });

      it('should update the registered device graph on deviceUpdated', function () {
        controller.deviceUpdate();

        expect(CustomerReportService.getDeviceData).not.toHaveBeenCalled();
        expect(CustomerGraphService.setActiveUsersGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setAvgRoomsGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setFilesSharedGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setMetricsGraph).not.toHaveBeenCalled();
        expect(CustomerGraphService.setMediaQualityGraph).not.toHaveBeenCalled();
      });
    });

    describe('helper functions', function () {
      it('getDescription and getHeader should return translated strings', function () {
        expect(controller.getDescription('text')).toEqual('text');
        expect(controller.getHeader('text')).toEqual('text');
      });

      it('goToUsersTab should send the customer to the users tab', function () {
        controller.goToUsersTab();
        expect($state.go).toHaveBeenCalled();
      });

      it('resetCards should alter the visible reports based on filters', function () {
        controller.resetCards(controller.engagement);
        expect(controller.displayEngagement).toBeTruthy();
        expect(controller.displayQuality).toBeFalsy();

        controller.resetCards(controller.quality);
        expect(controller.displayEngagement).toBeFalsy();
        expect(controller.displayQuality).toBeTruthy();

        controller.resetCards(controller.allReports);
        expect(controller.displayEngagement).toBeTruthy();
        expect(controller.displayQuality).toBeTruthy();
      });

      it('searchMostActive should return a list of users based on mostActiveUsers and the searchField', function () {
        expect(controller.searchMostActive()).toEqual([]);

        controller.mostActiveUsers = responseMostActiveData;
        expect(controller.searchMostActive()).toEqual(responseMostActiveData);

        controller.searchField = 'le';
        expect(controller.searchMostActive()).toEqual([responseMostActiveData[0], responseMostActiveData[11]]);
      });

      it('mostActiveUserSwitch should toggle the state for showMostActiveUsers', function () {
        expect(controller.showMostActiveUsers).toBeFalsy();
        controller.mostActiveUserSwitch();
        expect(controller.showMostActiveUsers).toBeTruthy();
        controller.mostActiveUserSwitch();
        expect(controller.showMostActiveUsers).toBeFalsy();
      });

      it('activePage should return true when called with the same value as activeUserCurrentPage', function () {
        controller.activeUserCurrentPage = 1;
        expect(controller.activePage(controller.activeUserCurrentPage)).toBeTruthy();
      });

      it('activePage should return false when called with a different value as activeUserCurrentPage', function () {
        expect(controller.activePage(7)).toBeFalsy();
      });

      it('changePage should change the value of activeUserCurrentPage', function () {
        controller.changePage(3);
        expect(controller.activeUserCurrentPage).toEqual(3);
      });

      it('isRefresh should return true when sent "refresh"', function () {
        expect(controller.isRefresh('refresh')).toBeTruthy();
      });

      it('isRefresh should return false when sent "set" or "empty"', function () {
        expect(controller.isRefresh('set')).toBeFalsy();
        expect(controller.isRefresh('empty')).toBeFalsy();
      });

      it('isEmpty should return true when sent "empty"', function () {
        expect(controller.isEmpty('empty')).toBeTruthy();
      });

      it('isEmpty should return false when sent "set" or "refresh"', function () {
        expect(controller.isEmpty('set')).toBeFalsy();
        expect(controller.isEmpty('refresh')).toBeFalsy();
      });

      it('mostActiveSort should sort by userName', function () {
        controller.mostActiveSort(0);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[0]);
        expect(controller.activeUserReverse).toBeFalsy();
      });

      it('mostActiveSort should sort by calls', function () {
        controller.mostActiveSort(1);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[1]);
        expect(controller.activeUserReverse).toBeTruthy();
      });

      it('mostActiveSort should sort by posts', function () {
        controller.mostActiveSort(2);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[2]);
        expect(controller.activeUserReverse).toBeTruthy();
      });

      it('pageForward should change carousel button numbers', function () {
        controller.activeUsersTotalPages = 4;
        controller.activeUserCurrentPage = 1;

        controller.pageForward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
        expect(controller.activeUserCurrentPage).toBe(2);

        controller.pageForward();
        expect(controller.activeButton[0]).toBe(2);
        expect(controller.activeButton[1]).toBe(3);
        expect(controller.activeButton[2]).toBe(4);
        expect(controller.activeUserCurrentPage).toBe(3);
      });

      it('pageBackward should change carousel button numbers', function () {
        controller.activeUsersTotalPages = 4;
        controller.activeButton[0] = 2;
        controller.activeButton[1] = 3;
        controller.activeButton[2] = 4;
        controller.activeUserCurrentPage = 3;

        controller.pageBackward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
        expect(controller.activeUserCurrentPage).toBe(2);

        controller.pageBackward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
        expect(controller.activeUserCurrentPage).toBe(1);
      });
    });

    describe('webex tests', function () {
      it('should show spark tab but not webex tab', function () {
        expect(controller.tab).not.toBeDefined();
      });

      it('should not have anything in the dropdown for webex reports', function () {
        expect(controller.webexOptions.length).toBe(0);
      });
    });
  });
});
