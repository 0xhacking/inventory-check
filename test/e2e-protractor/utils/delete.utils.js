'use strict';

var config = require('./test.config.js');
var utils = require('./test.utils.js');
var request = require('request');

exports.deleteUser = function (email) {
  return utils.getToken().then(function (token) {
    var options = {
      method: 'delete',
      url: config.getAdminServiceUrl() + 'user?email=' + encodeURIComponent(email),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
    };

    return utils.sendRequest(options).then(function () {
      return 200;
    });
  });
};

exports.deleteSquaredUCUser = function (customerUuid, userUuid, token) {
  var options = {
    method: 'delete',
    url: config.getCmiServiceUrl() + 'common/customers/' + customerUuid + '/users/' + userUuid,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  return utils.sendRequest(options).then(function () {
    return 204;
  });
};

exports.deleteSquaredUCCustomer = function (customerUuid, token) {
  var options = {
    method: 'delete',
    url: config.ServiceUrl() + 'common/customers/' + customerUuid,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  return utils.sendRequest(options).then(function () {
    return 204;
  });
};

// deleteAutoAttendant - Delete a specific autoattendant
//
// Called by deleteTestAA below.
exports.deleteAutoAttendant = function (aaUrl, token) {
  var options = {
    method: 'delete',
    url: aaUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  return utils.sendRequest(options).then(function () {
    return 200;
  });
};

exports.extractUUID = function (ceURL) {
  var uuidPos = ceURL.lastIndexOf("/");
  if (uuidPos === -1) {
    return '';
  }
  return ceURL.substr(uuidPos + 1);
};

// deleteNumberAssignments - Delete AA CMI number assignments
//
// Called by deleteTestAA below.
exports.deleteNumberAssignments = function (aaUrl, token) {

  var ceId = exports.extractUUID(aaUrl);

  var cmiUrl = config.getCmiV2ServiceUrl() + 'customers/' + helper.auth['huron-int1'].org + '/features/autoattendants/' + ceId + '/numbers';

  var options = {
    method: 'delete',
    url: cmiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  return utils.sendRequest(options).then(function () {
    return 204;
  });
};

// Save the test AA name here, this is also accessed from
// auto-attendant_spec.js
exports.testAAName = 'e2e AA Test Name';
// deleteTestAA - Delete the Test AA via the CES API
//
// Check all of the autoattendants eturned for this
// customer and if our test one is there send it to
// deleteAutoAttendant().
//
// Called by findAndDeleteTestAA below
//
// bearer - token with access to our API
// data - query results from our CES GET API
exports.deleteTestAA = function (bearer, data) {

  for (var i = 0; i < data.length; i++) {
    if (data[i].callExperienceName === this.testAAName) {

      return exports.deleteAutoAttendant(data[i].callExperienceURL, bearer).then(function () {

        return exports.deleteNumberAssignments(data[i].callExperienceURL, bearer);

      });
    }
  }
};

//
// findAndDeleteTestAA - Find the Test AA and call delete
//
// Used to cleanup AA created in the test
exports.findAndDeleteTestAA = function () {

  helper.getBearerToken('huron-int1', function (bearer) {
    var options = {
      url: config.getAutoAttendantsUrl(helper.auth['huron-int1'].org),
      headers: {
        Authorization: 'Bearer ' + bearer
      }
    };

    var defer = protractor.promise.defer();
    request(options,
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          defer.fulfill(JSON.parse(body));
        } else {
          defer.reject({
            error: error,
            message: body
          });
        }
      });
    return defer.promise.then(function (data) {
      return exports.deleteTestAA(bearer, data);
    });

  });
};
