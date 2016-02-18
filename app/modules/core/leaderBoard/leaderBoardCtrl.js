'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$q', '$scope', '$translate', 'Orgservice', 'Authinfo', 'FeatureToggleService',
    function ($q, $scope, $translate, Orgservice, Authinfo, FeatureToggleService) {

      // TODO: revisit after graduation (2016-02-17) - see if this can be moved into the template
      $scope.label = $translate.instant('leaderBoard.licenseUsage');

      $scope.state = 'license'; // Possible values are license, warning or error
      $scope.icon = 'check-gear';

      $scope.bucketKeys = [
        'messaging',
        'cf',
        'conferencing',
        'communication',
        'shared_devices',
        'storage',
        'sites'
      ];

      $scope.isCustomerAdmin = Authinfo.isCustomerAdmin();
      $scope.isAtlasTrialConversion = false;

      var getLicenses = function () {
        Orgservice.getLicensesUsage().then(function (subscriptions) {
          $scope.buckets = [];
          for (var index in subscriptions) {
            var licenses = subscriptions[index]['licenses'];
            var subscription = {};
            subscription['subscriptionId'] = subscriptions[index]['subscriptionId'];
            if (licenses.length === 0) {
              $scope.bucketKeys.forEach(function (bucket) {
                subscription[bucket] = {};
                subscription[bucket].unlimited = true;
              });
            } else {
              licenses.forEach(function (license) {
                var bucket = license.licenseType.toLowerCase();
                if (!(bucket === "cmr" || bucket === "conferencing")) {
                  subscription[bucket] = {};
                  var a = subscription[bucket];
                  a["services"] = [];
                }
                if (license.offerName !== "CF") {
                  if (license.siteUrl) {
                    if (!subscription["sites"]) {
                      subscription["sites"] = {};
                    }
                    if (!subscription["sites"][license.siteUrl]) {
                      subscription["sites"][license.siteUrl] = [];
                    }
                    subscription["sites"][license.siteUrl].push(license);
                    subscription["licensesCount"] = subscription.sites[license.siteUrl].length;
                    subscription.count = Object.keys(subscription["sites"]).length;
                  } else {
                    subscription[bucket]["services"].push(license);
                  }
                } else {
                  subscription["cf"] = {
                    "services": []
                  };
                  subscription["cf"]["services"].push(license);
                }
              });
            }
            $scope.buckets.push(subscription);
          }
        });
      };

      function init() {
        FeatureToggleService.supports(FeatureToggleService.features.atlasTrialConversion)
          .then(function (enabled) {
            $scope.isAtlasTrialConversion = enabled;
          });

        getLicenses();
      }

      init();

      $scope.$on('Userservice::updateUsers', function () {
        getLicenses();
      });
    }
  ])
  .directive('crLeaderBoardBucket', function () {
    return {
      restrict: 'EA',
      controller: 'leaderBoardCtrl',
      scope: {
        bucketName: '='
      },
      templateUrl: 'modules/core/leaderBoard/leaderBoard.tpl.html'
    };
  });
