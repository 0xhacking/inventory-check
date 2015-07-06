'use strict';

angular.module('Hercules')
  .controller('DashboardNextController',

    /* @ngInject */
    function ($scope, $state, $interval, $http, $modal, ClusterPoller, ConnectorService, ServiceDescriptor) {
      $scope.showInfoPanel = false;
      $scope.noServicesSelected = false;
      $scope.startSetupClicked = false;

      $scope.subscription = ClusterPoller.subscribe(angular.noop, {
        scope: $scope
      });

      $scope.clusters = ConnectorService.getClusters();

      $scope.clusterLength = function () {
        return _.size($scope.clusters);
      };

      $scope.$watch('services', function (services) {
        $scope.noServicesSelected = _.every(services.allExceptManagement, function (service) {
          return !service.enabled;
        });
        if ($scope.noServicesSelected) $scope.showInfoPanel = true;
      });

      ServiceDescriptor.services(function (error, services) {
        if (!error) {
          $scope.setServices(services);
        } else {
          $scope.setServices([]);
        }
      });

      $scope.showClusterDetails = function (cluster) {
        $state.go('cluster-details', {
          clusterId: cluster.id
        });
      };

      $scope.showNotificationConfigDialog = function () {
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'NotificationConfigController',
          templateUrl: 'modules/hercules/notification-config/notification-config.html'
        });
      };

      $scope.showServiceActivationDialog = function () {
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'ServiceActivationController',
          templateUrl: 'modules/hercules/dashboard/service-activation.html'
        });
      };

      $scope.showUserServiceStatusDialog = function (serviceId) {
        $scope.selectedServiceId = serviceId;
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'UserServiceStatusController',
          templateUrl: 'modules/hercules/dashboard/user-service-status.html'
        });
      };

      $scope.startSetup = function () {
        $scope.startSetupClicked = true;
      };

      $scope.setServices = function (services) {
        $scope.services = {
          all: services,
          enabledOnly: ServiceDescriptor.filterEnabledServices(services),
          allExceptManagement: ServiceDescriptor.filterAllExceptManagement(services)
        };
      };

      $scope.shouldShowWelcomeScreen = function () {
        return $scope.subscription.eventCount > 0 && !$scope.subscription.currentError && $scope.noServicesSelected && $scope.clusters.length === 0 && !$scope.startSetupClicked;
      };
    }
  )
  .filter('toArray', function() { return function(obj) {
    if (!(obj instanceof Object)) return obj;
    return _.toArray(obj);
  }});
