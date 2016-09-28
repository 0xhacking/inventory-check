'use strict';

describe('Component: resourceGroupCard', function () {
  beforeEach(angular.mock.module('Hercules'));

  describe('Controller', function () {
    var $componentController;
    var controller;
    var mockGroup = {
      clusters: [],
      id: '1',
      name: 'Bøler',
      numberOfUsers: 0,
      releaseChannel: 'stable'
    };

    beforeEach(inject(function ($injector) {
      $componentController = $injector.get('$componentController');
      controller = $componentController('resourceGroupCard', {
        $scope: {}
      }, {
        group: mockGroup
      });
    }));

    it('should bind to the correct group', function () {
      expect(controller.group.id).toEqual(mockGroup.id);
    });

    describe('hasZeroClusters()', function () {
      it('should be true if there are 0 clusters', function () {
        expect(controller.hasZeroClusters()).toEqual(true);
      });
    });

    describe('hasZeroUsers()', function () {
      it('should be true if there are 0 users', function () {
        expect(controller.hasZeroUsers()).toEqual(true);
      });
    });
  });
});
