(function () {
  'use strict';

  angular.module('Mediafusion').service('MetricsReportService', MetricsReportService);
  /* @ngInject */
  function MetricsReportService($http, $translate, $q, Authinfo, Notification, Log, chartColors, UrlConfig) {
    var urlBase = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    var utilizationUrl = '/utilization';
    var callVolumeUrl = '/call_volume';
    var clusterAvailability = '/clusters_availability';
    var agg_availability = '/agg_availability';
    var total_calls = '/total_calls';

    var cacheValue = (parseInt(moment.utc().format('H'), 10) >= 8);
    // Promise Tracking
    var ABORT = 'ABORT';
    var allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    var activePromise = null;
    var activePromiseForAvailability = null;
    var activePromiseForUtilization = null;
    var activePromiseForClusterAvailability = null;
    var activePromiseForTotalCalls = null;

    return {
      getUtilizationData: getUtilizationData,
      getCallVolumeData: getCallVolumeData,
      getAvailabilityData: getAvailabilityData,
      getClusterAvailabilityData: getClusterAvailabilityData,
      getTotalCallsData: getTotalCallsData
    };

    function getUtilizationData(time, cluster) {
      if (activePromiseForUtilization !== null && !_.isUndefined(activePromiseForUtilization)) {
        activePromiseForUtilization.resolve(ABORT);
      }
      activePromiseForUtilization = $q.defer();
      var returnData = {
        graphData: [],
        graphs: []
      };
      return getService(urlBase + getQuerys(utilizationUrl, cluster, time), activePromiseForUtilization).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data.chartData) && _.isArray(response.data.chartData) && !_.isUndefined(response.data)) {
          returnData.graphData.push(response.data.chartData);
          return adjustUtilizationData(response.data.chartData, returnData, response.data.startTime, response.data.endTime, response.data.graphs);
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Utilization data not returned for customer.', $translate.instant('mediaFusion.metrics.overallUtilizationGraphError'), returnData);
      });
    }

    function getCallVolumeData(time, cluster) {
      // cancel any currently running jobs
      if (activePromise !== null && !_.isUndefined(activePromise)) {
        activePromise.resolve(ABORT);
      }
      activePromise = $q.defer();
      var returnData = {
        graphData: []
      };
      return getService(urlBase + getQuerys(callVolumeUrl, cluster, time), activePromise).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data[0]) && !_.isUndefined(response.data[0].values) && _.isArray(response.data[0].values) && !_.isUndefined(response.data[0])) {
          returnData.graphData.push(response.data[0].values);
          return adjustCallVolumeData(response.data[0].values, returnData, response.data[0].startTime, response.data[0].endTime);
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Total Number of Calls data not returned for customer.', $translate.instant('mediaFusion.metrics.overallCallVolumeGraphError'), returnData);
      });
    }

    function getAvailabilityData(time, cluster) {
      // cancel any currently running jobs
      if (activePromiseForAvailability !== null && !_.isUndefined(activePromiseForAvailability)) {
        activePromiseForAvailability.resolve(ABORT);
      }
      activePromiseForAvailability = $q.defer();
      var returnData = [];
      return getService(urlBase + getQuerys(clusterAvailability, cluster, time), activePromiseForAvailability).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data) && !_.isUndefined(response.data[0]) && !_.isUndefined(response.data[0].clusterCategories) && _.isArray(response.data[0].clusterCategories)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Availability data not returned for customer.', $translate.instant('mediaFusion.metrics.overallAvailabilityGraphError'), returnData);
      });
    }

    function getClusterAvailabilityData(time, cluster) {
      // cancel any currently running jobs
      if (activePromiseForClusterAvailability !== null && !_.isUndefined(activePromiseForClusterAvailability)) {
        activePromiseForClusterAvailability.resolve(ABORT);
      }
      activePromiseForClusterAvailability = $q.defer();
      var returnData = [];
      return getService(urlBase + getQuerys(agg_availability, cluster, time), activePromiseForClusterAvailability).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Aggeregated Cluster Availability data not returned for customer.', $translate.instant('mediaFusion.metrics.overallClusterAvailabilityGraphError'), returnData);
      });
    }

    function getTotalCallsData(time, cluster) {
      if (cluster !== allClusters) {
        cluster = _.replace(cluster, /\W/g, '');
        cluster = cluster.toLowerCase();
      }
      // cancel any currently running jobs
      if (activePromiseForTotalCalls !== null && !_.isUndefined(activePromiseForTotalCalls)) {
        activePromiseForTotalCalls.resolve(ABORT);
      }
      activePromiseForTotalCalls = $q.defer();
      var returnData = [];
      return getService(urlBase + getQuerys(total_calls, cluster, time), activePromiseForTotalCalls).then(function (response) {
        if (!_.isUndefined(response) && !_.isUndefined(response.data)) {
          return response;
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Total Number of Calls not returned for customer.', $translate.instant('mediaFusion.metrics.overallTotalNumberOfCallsError'), returnData);
      });
    }

    function adjustCallVolumeData(activeData, returnData, startTime, endTime) {
      var returnDataArray = [];
      var graphItem = {
        colorOne: chartColors.metricBlue,
        colorTwo: chartColors.metricYellow,
        balloon: true,
        call_reject: 0,
        active_calls: 0,
        timestamp: null
      };
      var startDate = {
        colorOne: chartColors.metricBlue,
        colorTwo: chartColors.metricYellow,
        call_reject: 0,
        active_calls: 0,
        timestamp: startTime
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = angular.copy(graphItem);
        tmpItem.call_reject = activeData[i].call_reject;
        tmpItem.active_calls = activeData[i].active_calls;
        tmpItem.timestamp = activeData[i].timestamp;
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        colorOne: chartColors.metricBlue,
        colorTwo: chartColors.metricYellow,
        timestamp: endTime
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      return returnData;
    }

    function adjustUtilizationData(activeData, returnData, startTime, endTime, graphs) {
      var returnDataArray = [];
      var startDate = {
        time: startTime
      };
      activeData.unshift(startDate);
      for (var i = 0; i < activeData.length; i++) {
        var tmpItem = {};
        tmpItem = activeData[i];
        returnDataArray.push(tmpItem);
      }
      var endDate = {
        time: endTime
      };
      returnDataArray.push(endDate);
      returnData.graphData = returnDataArray;
      returnData.graphs = graphs;
      return returnData;
    }

    function getQuerys(link, cluster, time, cacheOption) {
      if (_.isUndefined(cacheOption) || cacheOption === null) {
        cacheOption = cacheValue;
      }
      if (cluster == allClusters) {
        return link + formRelativeTime(time);
      } else {
        return '/cluster/' + cluster + link + formRelativeTime(time);
      }
    }

    function formRelativeTime(time) {
      if (time.value === 0) {
        return '/?relativeTime=1d';
      } else if (time.value === 1) {
        return '/?relativeTime=7d';
      } else if (time.value === 2) {
        return '/?relativeTime=30d';
      } else {
        return '/?relativeTime=90d';
      }
    }

    function getService(url, canceler) {
      if (canceler === null || _.isUndefined(canceler)) {
        return $http.get(url);
      } else {
        return $http.get(url, {
          timeout: canceler.promise
        });
      }
    }

    function returnErrorCheck(error, debugMessage, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Log.debug('User not authorized to access reports.  Status: ' + error.status);
        Notification.error('reportsPage.unauthorizedError');
        return returnItem;
      } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
        if (error.status !== 0) {
          Log.debug(debugMessage + '  Status: ' + error.status + ' Response: ' + error.message);
        } else {
          Log.debug(debugMessage + '  Status: ' + error.status);
        }
        if (!_.isUndefined(error.data) && !_.isUndefined(error.data.trackingId) && (error.data.trackingId !== null)) {
          Notification.notify([message + '<br>' + $translate.instant('reportsPage.trackingId') + error.data.trackingId], 'error');
        } else {
          Notification.notify([message], 'error');
        }
        return returnItem;
      } else {
        return ABORT;
      }
    }
  }
})();
