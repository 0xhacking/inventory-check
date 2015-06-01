'use strict';

angular.module('Mediafusion')
  .service('MediafusionProxy', ['$interval', 'MediafusionConnectorService',
    function MediafusionProxy($interval, connectorService) {
      var pollPromise,
        error = null,
        clusters = [],
        callbacks = [],
        pollCount = 0,
        pollDelay = 1000,
        pollInFlight = false;

      var start = function (callback) {
        pollCount++;
        togglePolling();
        if (callback) callbacks.push(callback);
      };

      var stop = function () {
        if (pollCount > 0) pollCount--;
        togglePolling();
      };

      var deleteHost = function (clusterId, serial, callback) {
        connectorService.deleteHost(clusterId, serial, function () {
          var args = arguments;
          poll(function () {
            if (callback) callback.apply(args);
          });
        });
      };

      var getClusters = function (callback) {
        if (callback) {
          callbacks.push(callback);
        }
        return {
          error: error,
          clusters: clusters
        };
      };

      var upgradeSoftware = function (clusterId, serviceType, callback, opts) {
        connectorService.upgradeSoftware(clusterId, serviceType, function () {
          var args = arguments;
          poll(function () {
            if (callback) callback.apply(args);
          });
        }, opts);
      };

      var isPolling = function () {
        return !!pollCount;
      };

      var togglePolling = function () {
        if (pollCount <= 0) {
          $interval.cancel(pollPromise);
          pollInFlight = false;
          return;
        }
        if (pollInFlight) {
          return;
        }
        pollInFlight = true;

        if (pollPromise) $interval.cancel(pollPromise);
        pollPromise = $interval(poll, pollDelay, 1);
      };

      var poll = function (callback) {
        connectorService.fetch(function (err, _clusters) {
          error = err;
          clusters = _clusters || [];
          pollInFlight = false;
          togglePolling();
          if (callback) callback.apply(null, arguments);
          while ((callback = callbacks.pop()) != null) {
            if (_.isFunction(callback)) {
              callback.apply(null, arguments);
            }
          }
        }, {
          squelchErrors: true
        });
      };

      return {
        stopPolling: stop,
        startPolling: start,
        deleteHost: deleteHost,
        getClusters: getClusters,
        upgradeSoftware: upgradeSoftware,
        /* for testing */
        _isPolling: isPolling
      };
    }
  ]);
