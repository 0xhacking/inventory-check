(function () {
  'use strict';

  angular.module('Core')
    .factory('EmailService', EmailService);

  /* @ngInject */
  function EmailService($http, $rootScope, Config, Authinfo, Auth, LogMetricsService, UrlConfig) {

    var _types = {
      CUSTOMER_TRIAL: '1',
      NOTIFY_PARTNER_ADMIN_CUSTOMER_TRIAL_EXT_INTEREST: '15'
    };
    var _helpers = {
      mkTrialPayload: mkTrialPayload,
      mkTrialConversionReqPayload: mkTrialConversionReqPayload
    };
    var emailUrl = UrlConfig.getAdminServiceUrl() + 'email';

    var factory = {
      emailNotifyTrialCustomer: emailNotifyTrialCustomer,
      emailNotifyOrganizationCustomer: emailNotifyOrganizationCustomer,
      emailNotifyPartnerTrialConversionRequest: emailNotifyPartnerTrialConversionRequest,
      _types: _types,
      _helpers: _helpers
    };

    return factory;

    function mkTrialPayload(customerEmail, trialPeriod, organizationId) {
      return {
        type: _types.CUSTOMER_TRIAL,
        properties: {
          CustomerEmail: customerEmail,
          TrialPeriod: trialPeriod,
          OrganizationId: organizationId
        }
      };
    }

    // TODO: one of these is a dupe method, figure out which one makes sense to nuke and nuke it
    function emailNotifyTrialCustomer(customerEmail, trialPeriod, organizationId) {
      var emailData = mkTrialPayload(customerEmail, trialPeriod, organizationId);
      return email(emailData);
    }

    function emailNotifyOrganizationCustomer(customerAdminEmail, duration, organizationId) {
      var emailData = mkTrialPayload(customerAdminEmail, duration, organizationId);
      return email(emailData);
    }

    function mkTrialConversionReqPayload(customerName, customerEmail, partnerEmail) {
      return {
        type: _types.NOTIFY_PARTNER_ADMIN_CUSTOMER_TRIAL_EXT_INTEREST,
        properties: {
          CUSTOMER_NAME: customerName,
          CUSTOMER_EMAIL: customerEmail,
          PARTNER_EMAIL: partnerEmail,
          SUBJECT: customerName + ' wants to order or extend their trial'
        }
      };
    }

    // TODO: mv implemention to backend, front-end should shouldn't need this many properties
    function emailNotifyPartnerTrialConversionRequest(customerName, customerEmail, partnerEmail) {
      var emailData = mkTrialConversionReqPayload(customerName, customerEmail, partnerEmail);
      return email(emailData);
    }

    function email(_emailData) {
      var emailData = _emailData;
      return $http.post(emailUrl, emailData)
        .success(function (data, status, headers, config) {
          LogMetricsService.logMetrics('Email', LogMetricsService.getEventType('EmailService (success) - Type = ' + emailData.type), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        })
        .error(function (data, status, headers, config) {
          LogMetricsService.logMetrics('Email', LogMetricsService.getEventType('EmailService (error) - Type = ' + emailData.type), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        });
    }
  }
})();
