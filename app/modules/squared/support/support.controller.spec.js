'use strict';
describe('Controller: SupportCtrl', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var controller, Authinfo, Userservice, currentUser, Config, $scope;
  var roles = ["ciscouc.devsupport", "atlas-portal.support"];
  var user = {
    'success': true,
    'roles': roles
  };

  beforeEach(inject(function ($rootScope, $controller, _Userservice_) {
    Userservice = _Userservice_;
    Authinfo = {
      isCisco: function () {
        return false;
      },
      isCiscoMock: function () {
        return true;
      },
      isHelpDeskUser: function () {
        return false;
      },
      getOrgId: function () {
        return '123';
      },
      isInDelegatedAdministrationOrg: function () {
        return true;
      }
    };

    currentUser = {
      success: true,
      roles: ['ciscouc.devops', 'ciscouc.devsupport']
    };

    Config = {
      isProd: function () {
        return false;
      },
      getStatusPageUrl: function () {
        return 'http://www.blah.com';
      },
      getScimUrl: function () {
        return 'http://www.blah.com';
      },
      isIntegration: function () {
        return true;
      }
    };

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(currentUser, 200);
    });

    $scope = $rootScope.$new();
    Userservice = Userservice;
    controller = $controller('SupportCtrl', {
      $scope: $scope,
      Authinfo: Authinfo,
      Userservice: _Userservice_,
      Config: Config
    });
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should set showToolsCard to true for user has devsupport or devops role', function () {
    $scope.initializeShowToolsCard();
    expect($scope.showToolsCard).toEqual(true);
  });

  it('should return true for user has devsupport or devops role', function () {
    var isSupportRole = $scope.isCiscoDevRole(roles);
    expect(isSupportRole).toBe(true);
  });

});
