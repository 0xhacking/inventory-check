(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('cbgService', cbgService);

  /* @ngInject */
  function cbgService($http, $translate, UrlConfig) {
    var geminURL = UrlConfig.getGeminiUrl();
    var URL = {
      coutries: geminURL + 'countries',
      updateCallbackGroup: geminURL + 'callbackgroup/',
      downloadCountryUrl: geminURL + 'callbackgroup/countryRegionTemplate',
      callbackGroup: geminURL + 'callbackgroup/customerId/',
      activityLogs: geminURL + 'activityLogs'
    };
    var service = {
      getNotes: getNotes,
      moveSite: moveSite,
      postRequest: postRequest,
      getCountries: getCountries,
      getHistories: getHistories,
      cbgsExportCSV: cbgsExportCSV,
      getCallbackGroups: getCallbackGroups,
      getOneCallbackGroup: getOneCallbackGroup,
      updateCallbackGroup: updateCallbackGroup,
      getDownloadCountryUrl: getDownloadCountryUrl,
      updateCallbackGroupStatus: updateCallbackGroupStatus,
      postNote: postNote,
    };
    return service;

    function getCallbackGroups(customerId) {
      return $http.get(URL.callbackGroup + customerId).then(extractData);
    }

    function getOneCallbackGroup(customerId, groupId) {
      return $http.get(URL.callbackGroup + customerId + '/groupId/' + groupId).then(extractData);
    }

    function updateCallbackGroup(data) {
      return $http.put(URL.updateCallbackGroup, data).then(extractData);
    }

    function updateCallbackGroupStatus(customerId, ccaGroupId, operation, data) {
      if (!data) {
        data = {};
      }
      var url = URL.callbackGroup + customerId + '/groupId/' + ccaGroupId + '/status/' + operation;
      if (operation === 'cancel' || operation === 'decline') {
        url = URL.callbackGroup + customerId + '/groupId/' + ccaGroupId + '/' + operation;
      }
      return $http.put(url, data).then(extractData);
    }

    function getCountries() {
      return $http.get(URL.coutries).then(extractData);
    }

    function postRequest(customerId, data) {
      return $http.post(URL.callbackGroup + customerId, data).then(extractData);
    }

    function moveSite(data) {
      return $http.put(URL.updateCallbackGroup + 'movesite', data).then(extractData);
    }

    function postNote(data) {
      var url = URL.activityLogs;
      return $http.post(url, data).then(extractData);
    }

    function getNotes(customerId, ccaGroupId) {
      var url = URL.activityLogs + '/' + customerId + '/' + ccaGroupId + '/add_note';
      return $http.get(url).then(extractData);
    }

    function getHistories(customerId, ccaGroupId) {
      var url = URL.activityLogs + '/' + customerId + '/' + ccaGroupId + '/Callback%20Group';
      return $http.get(url).then(extractData);
    }

    function getDownloadCountryUrl() {
      return $http.get(URL.downloadCountryUrl).then(extractData);
    }

    function extractData(response) {
      return response.data;
    }

    function cbgsExportCSV(customerId) {
      var lines = [];
      var exportedLines = [];
      return getCallbackGroups(customerId).then(function (res) {
        lines = res.content.data.body;
        var headerLine = {
          groupName: $translate.instant('gemini.cbgs.field.cbgName'),
          totalSites: $translate.instant('gemini.cbgs.field.totalSites'),
          status: $translate.instant('gemini.cbgs.field.status_'),
          customerAttribute: $translate.instant('gemini.cbgs.field.alias'),
          sites: $translate.instant('gemini.cbgs.field.sites')
        };

        exportedLines.push(headerLine);
        if (!lines.length) {
          return exportedLines; // only export the header when is empty
        }
        _.forEach(lines, function (line) {
          exportedLines = exportedLines.concat(formateCsvData(line));
        });
        return exportedLines;
      });
    }

    function formateCsvData(data) {
      var newData = [];
      var oneLine = {};
      var cabte = data.customerAttribute;
      var groupName = (data.groupName ? data.groupName : data.customerName);
      var status = (data.status ? $translate.instant('gemini.cbgs.field.status.' + data.status) : '');
      cabte = (_.isNumber(cabte) ? '="' + cabte + '"' : cabte);
      groupName = (_.isNumber(groupName) ? '="' + groupName + '"' : groupName);

      if (!data.callbackGroupSites.length) {
        oneLine.groupName = groupName;
        oneLine.totalSites = data.totalSites;
        oneLine.status = status;
        oneLine.customerAttribute = cabte;
        oneLine.sites = '';
        newData.push(oneLine);
        return newData;
      }

      _.forEach(data.callbackGroupSites, function (row, key) {
        oneLine = {};
        if (!key) { // the first
          oneLine.groupName = groupName;
          oneLine.totalSites = data.totalSites;
          oneLine.status = status;
          oneLine.customerAttribute = cabte;
        } else {
          oneLine.groupName = '';
          oneLine.totalSites = '';
          oneLine.status = '';
          oneLine.customerAttribute = '';
        }
        oneLine.sites = row.siteUrl;
        newData.push(oneLine);
      });
      return newData;
    }
  }
})();
