'use strict';

describe('SiteListService: iframeable site test', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var $q;
  var $rootScope;

  var Authinfo;
  var UrlConfig;
  var WebExApiGatewayService;
  var SiteListService;

  var fakeSiteRow;

  var deferredIsSiteSupportsIframe;
  var deferredCsvStatus;

  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _Authinfo_,
    _UrlConfig_,
    _WebExApiGatewayService_,
    _SiteListService_
  ) {

    $q = _$q_;
    $rootScope = _$rootScope_;

    Authinfo = _Authinfo_;
    UrlConfig = _UrlConfig_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    SiteListService = _SiteListService_;

    deferredIsSiteSupportsIframe = $q.defer();
    deferredCsvStatus = $q.defer();

    fakeSiteRow = {
      license: {
        siteUrl: "fake.webex.com"
      },

      csvStatusCheckMode: {
        isOn: true,
        checkStart: 0,
        checkEnd: 0,
        checkIndex: 0
      },

      csvPollIntervalObj: null
    };

    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue("nobody@nowhere.com");
    spyOn(UrlConfig, 'getWebexAdvancedEditUrl').and.returnValue("fake.admin.webex.com");
    spyOn(UrlConfig, 'getWebexAdvancedHomeUrl').and.returnValue("fake.webex.com");
    spyOn(WebExApiGatewayService, 'isSiteSupportsIframe').and.returnValue(deferredIsSiteSupportsIframe.promise);
    spyOn(WebExApiGatewayService, 'csvStatus').and.returnValue(deferredCsvStatus.promise);
  })); // beforeEach(inject())

  it('can set up csv status polling', function () {
    SiteListService.updateWebExColumnsInRow(fakeSiteRow);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: true
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvPollIntervalObj).not.toEqual(null);
  });

  it('can process isIframeSupported=false and isAdminReportEnabled=false', function () {
    SiteListService.updateWebExColumnsInRow(fakeSiteRow);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: false,
      isAdminReportEnabled: false,
      isCSVSupported: false
    });

    $rootScope.$apply();

    expect(fakeSiteRow.isIframeSupported).toEqual(false);
    expect(fakeSiteRow.isAdminReportEnabled).toEqual(false);
    expect(fakeSiteRow.isCSVSupported).toEqual(false);

    expect(fakeSiteRow.showSiteLinks).toEqual(true);
    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=false and isAdminReportEnabled=true', function () {
    SiteListService.updateWebExColumnsInRow(fakeSiteRow);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: false,
      isAdminReportEnabled: true,
      isCSVSupported: false
    });

    $rootScope.$apply();

    expect(fakeSiteRow.isIframeSupported).toEqual(false);
    expect(fakeSiteRow.isAdminReportEnabled).toEqual(true);
    expect(fakeSiteRow.isCSVSupported).toEqual(false);

    expect(fakeSiteRow.showSiteLinks).toEqual(true);
    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=true and isAdminReportEnabled=false', function () {
    SiteListService.updateWebExColumnsInRow(fakeSiteRow);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: false,
      isCSVSupported: false
    });

    $rootScope.$apply();

    expect(fakeSiteRow.isIframeSupported).toEqual(true);
    expect(fakeSiteRow.isAdminReportEnabled).toEqual(false);
    expect(fakeSiteRow.isCSVSupported).toEqual(false);

    expect(fakeSiteRow.showSiteLinks).toEqual(true);
    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process isIframeSupported=true and isAdminReportEnabled=true', function () {
    SiteListService.updateWebExColumnsInRow(fakeSiteRow);

    deferredIsSiteSupportsIframe.resolve({
      siteUrl: "fake.webex.com",
      isIframeSupported: true,
      isAdminReportEnabled: true,
      isCSVSupported: false
    });

    $rootScope.$apply();

    expect(fakeSiteRow.isIframeSupported).toEqual(true);
    expect(fakeSiteRow.isAdminReportEnabled).toEqual(true);
    expect(fakeSiteRow.isCSVSupported).toEqual(false);

    expect(fakeSiteRow.showSiteLinks).toEqual(true);
    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });
}); // describe()

describe('SiteListService: csv status tests', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var $q;
  var $rootScope;

  var deferredCsvStatus;

  var SiteListService;
  var WebExApiGatewayService;

  var fakeSiteRow = null;

  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _WebExApiGatewayService_,
    _SiteListService_
  ) {

    $q = _$q_;
    $rootScope = _$rootScope_;

    WebExApiGatewayService = _WebExApiGatewayService_;
    SiteListService = _SiteListService_;

    deferredCsvStatus = $q.defer();

    fakeSiteRow = {
      license: {
        siteUrl: "fake.webex.com"
      },

      showCSVInfo: false,

      checkStart: false,
      checkEnd: false,
      checkIndex: false,

      csvStatusCheckMode: null,

      csvStatusObj: null,

      showExportLink: false,
      showExportInProgressLink: false,
      grayedExportLink: false,
      showExportResultsLink: false,
      exportFinishedWithErrors: false,

      showImportLink: false,
      showImportInProgressLink: false,
      grayedImportLink: false,
      showImportResultsLink: false,
      importFinishedWithErrors: false,
    };

    WebExApiGatewayService.csvStatusTypes = [
      'none',
      'exportInProgress',
      'exportCompletedNoErr',
      'exportCompletedWithErr',
      'importInProgress',
      'importCompletedNoErr',
      'importCompletedWithErr'
    ];

    spyOn(WebExApiGatewayService, 'csvStatus').and.returnValue(deferredCsvStatus.promise);
  })); // beforeEach(inject())

  it('can process csvStatus="none"', function () {
    fakeSiteRow.csvStatusCheckMode = {
      isOn: true,
      checkStart: 0,
      checkEnd: 0,
      checkIndex: 0
    };

    SiteListService.updateCSVColumnInRow(fakeSiteRow);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: 'none',
      completionDetails: null,
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvStatusObj.isTestResult).toEqual(true);
    expect(fakeSiteRow.csvStatusObj.status).toEqual("none");
    expect(fakeSiteRow.csvStatusObj.completionDetails).toEqual(null);

    expect(fakeSiteRow.showExportLink).toEqual(true);
    expect(fakeSiteRow.showExportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedExportLink).toEqual(false);
    expect(fakeSiteRow.showExportResultsLink).toEqual(false);
    expect(fakeSiteRow.exportFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showImportLink).toEqual(true);
    expect(fakeSiteRow.showImportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedImportLink).toEqual(false);
    expect(fakeSiteRow.showImportResultsLink).toEqual(false);
    expect(fakeSiteRow.importFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportInProgress"', function () {
    fakeSiteRow.csvStatusCheckMode = {
      isOn: true,
      checkStart: 1,
      checkEnd: 1,
      checkIndex: 1
    };

    SiteListService.updateCSVColumnInRow(fakeSiteRow);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: 'exportInProgress',
      completionDetails: null,
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvStatusObj.isTestResult).toEqual(true);
    expect(fakeSiteRow.csvStatusObj.status).toEqual("exportInProgress");
    expect(fakeSiteRow.csvStatusObj.completionDetails).toEqual(null);

    expect(fakeSiteRow.showExportLink).toEqual(false);
    expect(fakeSiteRow.showExportInProgressLink).toEqual(true);
    expect(fakeSiteRow.grayedExportLink).toEqual(false);
    expect(fakeSiteRow.showExportResultsLink).toEqual(false);
    expect(fakeSiteRow.exportFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showImportLink).toEqual(false);
    expect(fakeSiteRow.showImportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedImportLink).toEqual(true);
    expect(fakeSiteRow.showImportResultsLink).toEqual(false);
    expect(fakeSiteRow.importFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportCompletedNoErr"', function () {
    fakeSiteRow.csvStatusCheckMode = {
      isOn: true,
      checkStart: 2,
      checkEnd: 2,
      checkIndex: 2
    };

    SiteListService.updateCSVColumnInRow(fakeSiteRow);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: 'exportCompletedNoErr',
      completionDetails: {},
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvStatusObj.isTestResult).toEqual(true);
    expect(fakeSiteRow.csvStatusObj.status).toEqual("exportCompletedNoErr");
    expect(fakeSiteRow.csvStatusObj.completionDetails).not.toEqual(null);

    expect(fakeSiteRow.showExportLink).toEqual(true);
    expect(fakeSiteRow.showExportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedExportLink).toEqual(false);
    expect(fakeSiteRow.showExportResultsLink).toEqual(true);
    expect(fakeSiteRow.exportFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showImportLink).toEqual(true);
    expect(fakeSiteRow.showImportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedImportLink).toEqual(false);
    expect(fakeSiteRow.showImportResultsLink).toEqual(false);
    expect(fakeSiteRow.importFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="exportCompletedWithErr"', function () {
    fakeSiteRow.csvStatusCheckMode = {
      isOn: true,
      checkStart: 3,
      checkEnd: 3,
      checkIndex: 3
    };

    SiteListService.updateCSVColumnInRow(fakeSiteRow);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: 'exportCompletedWithErr',
      completionDetails: {},
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvStatusObj.isTestResult).toEqual(true);
    expect(fakeSiteRow.csvStatusObj.status).toEqual("exportCompletedWithErr");
    expect(fakeSiteRow.csvStatusObj.completionDetails).not.toEqual(null);

    expect(fakeSiteRow.showExportLink).toEqual(true);
    expect(fakeSiteRow.showExportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedExportLink).toEqual(false);
    expect(fakeSiteRow.showExportResultsLink).toEqual(true);
    expect(fakeSiteRow.exportFinishedWithErrors).toEqual(true);

    expect(fakeSiteRow.showImportLink).toEqual(true);
    expect(fakeSiteRow.showImportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedImportLink).toEqual(false);
    expect(fakeSiteRow.showImportResultsLink).toEqual(false);
    expect(fakeSiteRow.importFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importInProgress"', function () {
    fakeSiteRow.csvStatusCheckMode = {
      isOn: true,
      checkStart: 4,
      checkEnd: 4,
      checkIndex: 4
    };

    SiteListService.updateCSVColumnInRow(fakeSiteRow);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: 'importInProgress',
      completionDetails: null,
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvStatusObj.isTestResult).toEqual(true);
    expect(fakeSiteRow.csvStatusObj.status).toEqual("importInProgress");
    expect(fakeSiteRow.csvStatusObj.completionDetails).toEqual(null);

    expect(fakeSiteRow.showExportLink).toEqual(false);
    expect(fakeSiteRow.showExportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedExportLink).toEqual(true);
    expect(fakeSiteRow.showExportResultsLink).toEqual(false);
    expect(fakeSiteRow.exportFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showImportLink).toEqual(false);
    expect(fakeSiteRow.showImportInProgressLink).toEqual(true);
    expect(fakeSiteRow.grayedImportLink).toEqual(false);
    expect(fakeSiteRow.showImportResultsLink).toEqual(false);
    expect(fakeSiteRow.importFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importCompletedNoErr"', function () {
    fakeSiteRow.csvStatusCheckMode = {
      isOn: true,
      checkStart: 5,
      checkEnd: 5,
      checkIndex: 5
    };

    SiteListService.updateCSVColumnInRow(fakeSiteRow);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: 'importCompletedNoErr',
      completionDetails: {},
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvStatusObj.isTestResult).toEqual(true);
    expect(fakeSiteRow.csvStatusObj.status).toEqual("importCompletedNoErr");
    expect(fakeSiteRow.csvStatusObj.completionDetails).not.toEqual(null);

    expect(fakeSiteRow.showExportLink).toEqual(true);
    expect(fakeSiteRow.showExportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedExportLink).toEqual(false);
    expect(fakeSiteRow.showExportResultsLink).toEqual(false);
    expect(fakeSiteRow.exportFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showImportLink).toEqual(true);
    expect(fakeSiteRow.showImportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedImportLink).toEqual(false);
    expect(fakeSiteRow.showImportResultsLink).toEqual(true);
    expect(fakeSiteRow.importFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });

  it('can process csvStatus="importCompletedWithErr"', function () {
    fakeSiteRow.csvStatusCheckMode = {
      isOn: true,
      checkStart: 6,
      checkEnd: 6,
      checkIndex: 6
    };

    SiteListService.updateCSVColumnInRow(fakeSiteRow);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: 'importCompletedWithErr',
      completionDetails: {},
    });

    $rootScope.$apply();

    expect(fakeSiteRow.csvStatusObj.isTestResult).toEqual(true);
    expect(fakeSiteRow.csvStatusObj.status).toEqual("importCompletedWithErr");
    expect(fakeSiteRow.csvStatusObj.completionDetails).not.toEqual(null);

    expect(fakeSiteRow.showExportLink).toEqual(true);
    expect(fakeSiteRow.showExportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedExportLink).toEqual(false);
    expect(fakeSiteRow.showExportResultsLink).toEqual(false);
    expect(fakeSiteRow.exportFinishedWithErrors).toEqual(false);

    expect(fakeSiteRow.showImportLink).toEqual(true);
    expect(fakeSiteRow.showImportInProgressLink).toEqual(false);
    expect(fakeSiteRow.grayedImportLink).toEqual(false);
    expect(fakeSiteRow.showImportResultsLink).toEqual(true);
    expect(fakeSiteRow.importFinishedWithErrors).toEqual(true);

    expect(fakeSiteRow.showCSVInfo).toEqual(true);
  });
}); // describe()

describe('SiteListService: license types tests', function () {
  //Load the required dependent modules
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  //Declare the variables
  var $q, $rootScope, SiteListService, WebExApiGatewayService, WebExUtilsFact, fake_gridData, fake_allSitesLicenseInfo;
  var deferred_licenseInfo;

  //Inject the required dependent services/factories/data/etc
  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _SiteListService_,
    _WebExApiGatewayService_,
    _WebExUtilsFact_
  ) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    SiteListService = _SiteListService_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    WebExUtilsFact = _WebExUtilsFact_;

    deferred_licenseInfo = $q.defer();

    //Define the fake data
    fake_gridData = [{
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_5b2fe3b2-fff2-4711-9d6e-4e45fe61ce52_200_sjsite14.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test201582703",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "ACTIVE",
        "capacity": 200,
        "siteUrl": "sjsite14.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Meeting Center 25",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_5f078901-2e59-4129-bba4-b2126d356b61_25_sjsite04.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test201592302",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 25,
        "siteUrl": "sjsite04.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_3ada1218-1763-428b-bb7f-d03f8ea91fa1_200_t30citestprov9.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test1443208805",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "t30citestprov9.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Meeting Center 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "MC_3ada1218-1763-428b-bb7f-d03f8da91fa1_200_cisjsite031.webex.com",
        "offerName": "MC",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt30test1443208885",
        "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
        "volume": 25,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "cisjsite031.webex.com"
      },
      "isCustomerPartner": false
    }];

    fake_allSitesLicenseInfo = [{
      "webexSite": "sjsite14.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "t30citestprov9.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "sjsite04.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "sjsite14.webex.com",
      "siteHasCMRLicense": true,
      "offerCode": "CMR",
      "capacity": "100"
    }, {
      "webexSite": "cisjsite031.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "200"
    }, {
      "webexSite": "sjsite04.webex.com",
      "siteHasMCLicense": true,
      "offerCode": "MC",
      "capacity": "25"
    }];

    //Create spies
    spyOn(WebExUtilsFact, "getAllSitesWebexLicenseInfo").and.returnValue(deferred_licenseInfo.promise);

  }));

  //1. Check service exists
  it(': should exist as a service', function () {
    expect(SiteListService).toBeDefined();
  });

  //2. Check mock data exists
  it(': fake_allSitesLicenseInfo should exist', function () {
    expect(fake_allSitesLicenseInfo).not.toBe(null);
  });

  //3. Test for license type column data
  it(': fake_allSitesLicenseInfo should exist', function () {
    SiteListService.updateLicenseTypesColumn(fake_gridData);
    deferred_licenseInfo.resolve(fake_allSitesLicenseInfo);
    $rootScope.$apply();

    expect(fake_gridData).not.toBe(null);
    expect(fake_gridData.length).toBe(4);

    //3.1 sjsite14.webex.com has multiple licenses: MC & CMR
    expect(fake_gridData[0].MCLicensed).toBe(true);
    expect(fake_gridData[0].CMRLicensed).toBe(true);
    expect(fake_gridData[0].multipleWebexServicesLicensed).toBe(true);
    expect(fake_gridData[0].licenseTypeContentDisplay).toBe("siteList.multipleLicenses");
    expect(fake_gridData[0].licenseTooltipDisplay).toBe("helpdesk.licenseDisplayNames.MC<br>helpdesk.licenseDisplayNames.CMR");

    //3.2 t30citestprov9.webex.com has a single license: MC
    expect(fake_gridData[2].MCLicensed).toBe(true);
    expect(fake_gridData[2].multipleWebexServicesLicensed).toBe(false);
    expect(fake_gridData[2].licenseTypeContentDisplay).toBe("helpdesk.licenseDisplayNames.MC");
    expect(fake_gridData[2].licenseTooltipDisplay).toBe(null);

  });
}); //END describe
