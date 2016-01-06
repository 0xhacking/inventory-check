'use strict';

angular.module('Core')
  .directive('gridscrollbar', ['$timeout',
    function ($timeout) {
      return {
        restrict: 'A',
        link: function () {
          $timeout(function () {
            $('.ui-grid-viewport').niceScroll({
              cursoropacitymax: 0.5,
              cursorwidth: 10,
              horizrailenabled: false,
              scrollspeed: 120,
            });
          });
        }
      };
    }
  ]);
