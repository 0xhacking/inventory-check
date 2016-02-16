'use strict';

describe('WebExSiteSettingsCtrl Test', function () {
  var $controller;
  var $scope;
  var $stateParams;
  var WebExSiteSettingsFact;
  var Authinfo;

  var siteUrl = 'go.webex.com';
  var email = "mojoco@webex.com";

  beforeEach(module('WebExApp'));

  beforeEach(inject(function (
    _Authinfo_,
    _$controller_
  ) {

    Authinfo = _Authinfo_;

    $scope = {};
    $controller = _$controller_;

    $stateParams = {
      'siteUrl': siteUrl
    };

    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);

    var controller = $controller('WebExSiteSettingsCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      Authinfo: Authinfo,
    });
  }));

  it('should set the correct scope values', function () {
    expect($scope.siteUrl).toEqual(siteUrl);
    expect($scope.adminEmailParam).toEqual(email);
  });
});
