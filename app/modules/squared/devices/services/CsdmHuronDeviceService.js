(function () {
  'use strict';

  angular
    .module('Squared')
    .service('CsdmHuronOrgDeviceService', CsdmHuronOrgDeviceService)
    .service('CsdmHuronUserDeviceService', CsdmHuronUserDeviceService);

  function CsdmHuronUserDeviceService($injector, Authinfo, CsdmConfigService) {
    function create(userId) {
      var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/devices/?cisUuid=' + userId + '&type=huron';
      var service = $injector.instantiate(CsdmHuronDeviceService, {
        devicesUrl: devicesUrl
      });
      return service;
    }

    return {
      create: create
    };
  }

  function CsdmHuronOrgDeviceService($injector, Authinfo, CsdmConfigService) {
    function create() {
      var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/devices/?type=huron';
      return $injector.instantiate(CsdmHuronDeviceService, {
        devicesUrl: devicesUrl
      });
    }

    return {
      create: create
    };
  }

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, HuronConfig, CsdmConverter, Notification, devicesUrl) {

    function huronEnabled() {
      return $q.when(Authinfo.isSquaredUC());
    }

    function getCmiUploadLogsUrl(userId, deviceId) {
      return HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/users/' + userId + '/phones/' + deviceId + '/commands/logs';
    }

    function getDirectoryNumbersUrl(userId) {
      return HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/' + userId + '/directorynumbers';
    }

    function getAlternateNumbersUrl(directoryNumberId) {
      return HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/directorynumbers/' + directoryNumberId + '/alternatenumbers?alternatenumbertype=%2BE.164+Number';
    }

    function getPhoneUrl(deviceId, cisUuid) {
      return HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/users/' + cisUuid + '/phones/' + deviceId;
    }

    function encodeHuronTags(description) {
      return _.replace(description, /"/g, "'");
    }

    var deviceList = {};
    var loadedData = false;

    function fetch() {
      return huronEnabled().then(function (enabled) {
        return !enabled ? $q.when([]) : $http.get(devicesUrl).then(function (res) {
          loadedData = true;
          _.extend(deviceList, CsdmConverter.convertHuronDevices(res.data));
        }, function () {
          loadedData = true;
        });
      });
    }

    function fetchDevices() {
      return $http.get(devicesUrl).then(function (res) {
        return CsdmConverter.convertHuronDevices(res.data);
      });
    }

    function dataLoaded() {
      return !Authinfo.isSquaredUC() || loadedData;
    }

    function getDeviceList() {
      return deviceList;
    }

    function deleteItem(device) {
      return $http.delete(device.url);
    }

    function deleteDevice(deviceUrl) {
      return $http.delete(deviceUrl);
    }

    function getLinesForDevice(huronDevice) {
      return $http.get(getDirectoryNumbersUrl(huronDevice.cisUuid))
        .then(function (res) {
          var lines = [];
          return $q.all(_.map(res.data, function (directoryNumber) {
            var line = {
              'directoryNumber': directoryNumber.directoryNumber.pattern,
              'usage': directoryNumber.dnUsage
            };
            return $http.get(getAlternateNumbersUrl(directoryNumber.directoryNumber.uuid)).then(function (alternates) {
              if (alternates.data && alternates.data[0]) {
                line.alternate = alternates.data[0].numMask;
              }
              lines.push(line);
            });
          })).then(function () {
            return lines;
          });
        });
    }

    function getTimezoneForDevice(huronDevice) {
      return $http.get(getPhoneUrl(huronDevice.huronId, huronDevice.cisUuid))
        .then(function (res) {
          var timeZone = null;
          if (res.data) {
            timeZone = res.data.timeZone;
          }
          return timeZone;
        });
    }

    function setTimezoneForDevice(huronDevice, timezone) {
      return $http.put(getPhoneUrl(huronDevice.huronId, huronDevice.cisUuid), {
        timeZone: timezone
      });
    }

    function resetDevice(url) {
      return $http.put(url, {
        actions: {
          reset: true
        }
      });
    }

    function updateTags(url, tags) {
      var jsonTags = encodeHuronTags(JSON.stringify(tags || []));
      if (jsonTags.length >= 128) {
        return $q.reject("List of tags is longer than supported.");
      }

      return $http.put(url, {
        description: jsonTags
      });
    }

    function uploadLogs(device, feedbackId) {
      return $http.post(getCmiUploadLogsUrl(device.cisUuid, device.huronId), {
        ticketId: feedbackId
      });
    }

    return {

      fetchDevices: fetchDevices,
      deleteItem: deleteItem,
      updateTags: updateTags,
      dataLoaded: dataLoaded,
      getDeviceList: getDeviceList,
      deleteDevice: deleteDevice,
      getLinesForDevice: getLinesForDevice,
      getTimezoneForDevice: getTimezoneForDevice,
      setTimezoneForDevice: setTimezoneForDevice,
      resetDevice: resetDevice,
      uploadLogs: uploadLogs,

      fetch: fetch,
    };
  }
})();
