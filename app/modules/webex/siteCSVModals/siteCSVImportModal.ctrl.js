(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVImportModalCtrl', SiteCSVImportModalCtrl);

  /*@ngInject*/
  function SiteCSVImportModalCtrl(
	$scope,
    $state,
    $stateParams,
    $translate,
    $log,
    Notification,
    WebExApiGatewayService,
    SiteListService
  ) {
    var funcName = "SiteCSVImportModalCtrl()";
    var logMsg = '';
    var vm = this;

    logMsg = funcName + "\n" +
      "$stateParams=" + JSON.stringify($stateParams);
    $log.log(logMsg);

    vm.modal = {};

    vm.csvImportObj = $stateParams.csvImportObj;
    vm.siteUrl = vm.csvImportObj.license.siteUrl;
    vm.viewReady = true;
    vm.resetFile = resetFile;

    vm.onFileSizeError = function () {
      Notification.error($translate.instant('firstTimeWizard.csvMaxSizeError'));
    };

    vm.onFileTypeError = function () {
      Notification.error($translate.instant('firstTimeWizard.csvFileTypeError'));

    };

    function resetFile() {
      vm.modal.file = null;
    }

    vm.startImport = function () {
      var funcName = "SiteCSVImportModalCtrl.startImport()";

      logMsg = funcName + "\n" +
        "vm.siteUrl=" + JSON.stringify(vm.siteUrl) +
        "vm.csvImportObj=" + JSON.stringify(vm.csvImportObj) +
        "vm.modal.file=" + JSON.stringify(vm.modal.file);
      //$log.log(logMsg);

      //TBD: Don't use then(successfn,errorfn), its deprecated in some libraries. Instead use promise.catch(errorfn).then(successfn)
      WebExApiGatewayService.csvImport(vm.siteUrl, vm.modal.file).then(
        function success(response) {
          if (_.isFunction($scope.$close)) {
            $scope.$close();
          }

          Notification.success($translate.instant('siteList.importStartedToast'));
          SiteListService.updateCSVColumnInRow(vm.csvImportObj);
        },

        function error(response) {
          // TBD: Actual error result handling
          Notification.error($translate.instant('siteList.importRejectedToast'));
        }
      ).catch(
        function catchError(response) {
          Notification.error($translate.instant('siteList.importRejectedToast'));
          SiteListService.updateCSVColumnInRow(vm.csvImportObj);
        }
      ); // WebExApiGatewayService.csvImport()
    };
  } // SiteCSVImportModalCtrl()
})(); // top level function
