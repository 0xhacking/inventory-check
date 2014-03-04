'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Authinfo', function Authinfo() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var authData = {
        'username': null,
        'orgname' : null,
        'addUserEnabled' : null
      };
    
    return {
      initialize: function(data) {
        authData.username = data.name;
        authData.orgname = data.orgName;
        authData.addUserEnabled = data.addUserEnabled;
      },

      clear: function() {
        authData.username = null;
        authData.orgname = null;
        authData.addUserEnabled = null;
      },

      getOrgName: function() {
        return authData.orgname;
      },

      getUserName: function() {
        return authData.username;
      },

      isAddUserEnabled: function() {
        return authData.addUserEnabled;
      }
    };
  });
