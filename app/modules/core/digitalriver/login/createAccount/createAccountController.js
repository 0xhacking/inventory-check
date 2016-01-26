'use strict';

angular.module('Core')
  .controller('createAccountController', ['$scope', '$location', '$window', '$log', '$cookies', 'Userservice',
    function ($scope, $location, $window, $log, $cookies, Userservice) {

      $scope.email1 = $location.search().email;

      $scope.handleCreateAccount = function () {

        if (!$scope.email1 || 0 === $scope.email1.trim().length) {
          $scope.error = "Empty email";
          return;
        } else if (!$scope.password1 || 0 === $scope.password1.trim()) {
          $scope.error = "Empty password";
          return;
        } else if ($scope.email1 !== $scope.email2) {
          $scope.error = "Emails do not match";
          return;
        } else if ($scope.password1 != $scope.password2) {
          $scope.error = "Passwords do not match";
          return;
        }

        Userservice.addDrUser({
            'emailPassword': {
              'email': $scope.email1,
              'password': $scope.password1
            }
          },
          function (result, status) {
            if (status != 200 || !result.success) {
              $scope.error = result.message;
            } else {
              $cookies.atlasDrCookie = result.data.token;
              $window.location.href = "https://www.digitalriver.com/";
            }
          });
      };

    }
  ]);
