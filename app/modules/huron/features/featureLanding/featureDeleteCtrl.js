/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';
  /* jshint validthis: true */
  angular
    .module('Huron')
    .controller('HuronFeatureDeleteCtrl', HuronFeatureDeleteCtrl);

  /* @ngInject */
  function HuronFeatureDeleteCtrl($rootScope, $scope, $stateParams, $timeout, $translate, AAModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, Notification, Log) {
    var vm = this;
    vm.featureId = $stateParams.deleteFeatureId;
    vm.featureName = $stateParams.deleteFeatureName;
    vm.featureFilter = $stateParams.deleteFeatureType;
    vm.featureType = vm.featureFilter === 'AA' ? $translate.instant('autoAttendant.title') : vm.featureFilter === 'HG' ?
      $translate.instant('huntGroup.title') : 'Feature';

    vm.deleteBtnDisabled = false;

    vm.deleteFeature = deleteFeature;
    vm.deleteSuccess = deleteSuccess;
    vm.deleteError = deleteError;

    function deleteFeature() {

      vm.deleteBtnDisabled = true;

      if (vm.featureFilter === 'AA') {

        var aaModel = AAModelService.getAAModel();
        var ceInfoToDelete;
        for (var i = 0; i < aaModel.ceInfos.length; i++) {
          var ceUrl = aaModel.ceInfos[i].getCeUrl();
          var uuidPos = ceUrl.lastIndexOf("/");
          var uuid = ceUrl.substr(uuidPos + 1);
          if (uuid === vm.featureId) {
            ceInfoToDelete = aaModel.ceInfos[i];
            aaModel.ceInfos.splice(i, 1);
            break;
          }
        }

        if (ceInfoToDelete === undefined) {
          deleteError();
          return;
        }

        AutoAttendantCeService.deleteCe(ceInfoToDelete.getCeUrl()).then(
          function (data) {
            AutoAttendantCeInfoModelService.deleteCeInfo(aaModel.aaRecords, ceInfoToDelete);
            deleteSuccess();
          },
          function (response) {
            deleteError(response);
          }
        );
      }
      // else if (vm.featureFilter === 'hg') {
      // } else if (vm.featureFilter === 'cp') {
      //   //
      // } 
      else {
        return;
      }

    }

    function deleteSuccess() {
      vm.deleteBtnDisabled = false;

      if (angular.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }

      $timeout(function () {
        $rootScope.$broadcast('HUNT_GROUP_DELETED');
        Notification.success('huronFeatureDetails.deleteSuccessText', {
          featureName: vm.featureName,
          featureType: vm.featureType
        });
      }, 250);
    }

    function deleteError(response) {
      vm.deleteBtnDisabled = false;

      if (angular.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }
      Log.warn('Failed to delete the ' + vm.featureType + ' with name: ' + vm.featureName + ' and id:' + vm.featureId);

      var error = $translate.instant('huronFeatureDetails.deleteFailedText', {
        featureName: vm.featureName,
        featureType: vm.featureType
      });
      if (response) {
        if (response.status) {
          error += $translate.instant('errors.statusError', {
            status: response.status
          });
          if (response.data && angular.isString(response.data)) {
            error += ' ' + $translate.instant('huronFeatureDetails.messageError', {
              message: response.data
            });
          }
        } else {
          error += 'Request failed.';
          if (angular.isString(response.data)) {
            error += ' ' + response.data;
          }
        }
      }
      Notification.error(error);
    }
  }

})();
