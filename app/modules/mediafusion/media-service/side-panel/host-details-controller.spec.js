'use strict';

describe('Controller: HostDetailsController', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var controller, MediaClusterService, XhrNotificationService;

  beforeEach(inject(function ($controller, $stateParams, $state, _MediaClusterService_, _XhrNotificationService_, $translate) {
    $stateParams = $stateParams;
    $state = $state;
    MediaClusterService = _MediaClusterService_;
    XhrNotificationService = _XhrNotificationService_;
    $translate = $translate;

    controller = $controller('GroupDetailsController', {
      $stateParams: $stateParams,
      $state: $state,
      MediaClusterService: MediaClusterService,
      XhrNotificationService: XhrNotificationService,
      $translate: $translate
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

});
