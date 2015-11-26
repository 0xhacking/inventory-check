'use strict';
/* global $, Bloodhound, moment */
angular.module('Squared')
  .controller('BillingCtrl', ['$scope', '$filter', '$rootScope', 'Notification', 'Log', 'Config', 'Utils', 'Storage', 'Authinfo', '$translate', 'PageParam', '$stateParams', '$window', 'BillingService', '$log',
    function ($scope, $filter, $rootScope, Notification, Log, Config, Utils, Storage, Authinfo, $translate, PageParam, $stateParams, $window, BillingService, $log) {

      var enc;
      $scope.orderDetails = [];

      if (PageParam.getParam('enc')) {
        enc = PageParam.getParam('enc');
        PageParam.clear();
      } else if ($stateParams.enc) {
        enc = $stateParams.enc;
      }

      var getOrderStatus = function (enc) {
        BillingService.getOrderStatus(enc, function (data, status) {
          if (data.success) {
            $scope.orderDetails.push(data);
          } else {
            Log.debug('Failed to retrieve order status. Status: ' + status);
            Notification.notify([$translate.instant('billingPage.errOrderStatus', {
              status: status
            })], 'error');
          }
        });
      };

      if (enc != null) {
        getOrderStatus(enc);
      }

      $scope.resendCustomerEmail = function (orderId) {
        BillingService.resendCustomerEmail(orderId, function (data, status) {
          if (data != null) {
            Notification.notify([$translate.instant('billingPage.customerEmailSuccess')], 'success');
          } else {
            Log.debug('Failed to resend customer email. Status: ' + status);
            Notification.notify([$translate.instant('billingPage.errCustomerEmail', {
              status: status
            })], 'error');
          }
          angular.element('.open').removeClass('open');
        });
      };

      $scope.resendPartnerEmail = function (orderId) {
        BillingService.resendPartnerEmail(orderId, function (data, status) {
          if (data != null) {
            Notification.notify([$translate.instant('billingPage.partnerEmailSuccess')], 'success');
          } else {
            Log.debug('Failed to resend customer email. Status: ' + status);
            Notification.notify([$translate.instant('billingPage.errPartnerEmail', {
              status: status
            })], 'error');
          }
          angular.element('.open').removeClass('open');
        });
      };

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showUserDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var actionsTemplate = '<span dropdown>' +
        '<button id="actionsButton" class="btn--icon btn--actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li id="resendCustomerEmail"><a ng-click="$event.stopPropagation(); resendCustomerEmail(row.entity.orderId); "><span translate="billingPage.sendCustomer"></span></a></li>' +
        '<li ng-if="row.entity.partnerOrgId" id="resendPartnerEmail"><a ng-click="$event.stopPropagation(); resendPartnerEmail(row.entity.orderId); "><span translate="billingPage.sendPartner"></span></a></li>' +
        '</ul>' +
        '</span>';

      $scope.gridOptions = {
        data: 'orderDetails',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,
        sortInfo: {
          fields: ['sbpOrderId'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'sbpOrderId',
          displayName: $filter('translate')('billingPage.sbpOrderId'),
          sortable: true
        }, {
          field: 'action',
          displayName: $filter('translate')('billingPage.action'),
          sortable: false,
          cellTemplate: actionsTemplate
        }]
      };

    }
  ]);
