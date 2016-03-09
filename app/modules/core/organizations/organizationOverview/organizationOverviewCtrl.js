(function () {
  'use strict';

  angular.module('Core')
    .controller('OrganizationOverviewCtrl', OrganizationOverviewCtrl);

  /*ngInject*/
  function OrganizationOverviewCtrl($stateParams, $rootScope, $scope, $state, Log, $filter, Orgservice, Notification) {
    $scope.currentOrganization = $stateParams.currentOrganization;
    var currentOrgId = $scope.currentOrganization.id;
    $scope.setEftToggle = setEftToggle;
    $scope.eftToggleLoading = true;
    $scope.updateEftToggle = updateEftToggle;
    $scope.currentOrganization.isEFT = false;
    $scope.currentEftSetting = false;
    init();

    function init() {
      getOrgInfo();
      updateEftToggle();
    }

    function getOrgInfo() {
      Orgservice.getAdminOrg(function (data, status) {
        if (data.success) {
          $scope.org = data;
          if (data.services) {
            $scope.svcs = data.services;
          }
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }
      }, $scope.currentOrganization.id, true);
    }

    function updateEftToggle() {
      return Orgservice.getEftSetting(currentOrgId)
        .then(function (response) {
          _.set($scope, 'currentOrganization.isEFT', response.data.eft);
          $scope.currentEftSetting = response.data.eft;
        })
        .catch(function (response) {
          Notification.error('organizationsPage.eftError');
        })
        .finally(function (response) {
          $scope.eftToggleLoading = false;
        });
    }

    function setEftToggle(eft) {
      if ($scope.currentEftSetting !== $scope.currentOrganization.isEFT) {
        $scope.eftToggleLoading = true;
        Orgservice.setEftSetting(eft, currentOrgId)
          .then(updateEftToggle)
          .catch(function (response) {
            _.set($scope, 'currentOrganization.isEFT', $scope.currentEftSetting);
            Notification.error('organizationsPage.eftError');
          });
      }
    }
    //Making sure the search field is cleared
    $('#search-input').val('');

    //A div used to cover the export button when it's disabled.
    $('#btncover').hide();

    $scope.exportBtn = {
      title: $filter('translate')('organizationsPage.exportBtn'),
      disabled: false
    };

    if ($rootScope.exporting === true) {
      $scope.exportBtn.title = $filter('translate')('organizationsPage.loadingMsg');
      $scope.exportBtn.disabled = true;
      $('#btncover').show();
    }

    $scope.$on('AuthinfoUpdated', function () {
      getOrgInfo();
    });

    $scope.manageFeatures = function () {
      $state.go('organization-overview.features');
    };
  }
})();
