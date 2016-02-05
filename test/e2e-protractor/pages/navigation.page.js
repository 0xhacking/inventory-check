'use strict';

var Navigation = function () {
  this.body = element(by.tagName('body'));

  this.tabs = element(by.css('cs-left-nav'));
  this.tabCount = element.all(by.repeater('page in pages'));
  this.homeTab = element(by.css('li.overviewTab > a'));
  this.usersTab = element(by.css('li.userTab > a'));
  this.accountTab = element(by.css('li.accountTab > a'));
  this.orgTab = element(by.css('a[href="#organizations"]'));
  this.orgAddTab = element(by.css('#addOrganizations'));
  this.callRoutingTab = element(by.css('a[href="#callrouting"]'));
  this.autoAttendantPage = element(by.css('a[href="#/hurondetails/features"]'));
  this.fusionTab = element(by.css('a[href="#fusion"]'));
  this.reportsTab = element(by.css('li.reportTab > a'));
  this.supportTab = element(by.css('li.supportTab > a'));
  this.cdrTab = element(by.css('a[href="#cdrsupport"]'));
  this.logsTab = element(by.css('a[href="#support"]'));
  this.logsPage = element(by.cssContainingText('.nav-link', 'Logs'));

  this.billingTab = element(by.css('a[href="#orderprovisioning"]'));
  this.devicesTab = element(by.css('li.deviceTab > a'));
  this.customersTab = element(by.css('li.customerTab > a'));
  this.developmentTab = element(by.css('li.developmentTab > a'));
  this.servicesTab = element(by.css('li.servicesTab > a'));
  this.meetingsTab = element(by.css('a[href="#meetings"]'));
  this.mediaFusionMgmtTab = element(by.css('a[href="#mediafusionconnector"]'));
  this.enterpriseResourcesTab = element(by.css('a[href="#vts"]'));
  this.utilizationTab = element(by.css('a[href="#utilization"]'));

  // hybrid services
  this.activateService = element(by.id('activateService'));
  this.deactivateService = element(by.id('deactivateService'));
  this.calendarServicePage = element(by.css('a[href="#services/calendar"]'));
  this.callServicePage = element(by.css('a[href="#services/call"]'));
  this.serviceResources = element(by.cssContainingText('.nav-link', 'Resources'));
  this.serviceSettings = element(by.cssContainingText('.nav-link', 'Settings'));

  this.settings = element(by.id('setting-bar'));
  this.feedbackLink = element(by.id('feedback-lnk'));
  this.supportLink = element(by.id('support-lnk'));
  this.username = element(by.binding('username'));
  this.orgname = element(by.binding('orgname'));
  this.userInfoButton = element(by.css('.user-info button'));
  this.logoutButton = element(by.css('#logout-btn a'));
  this.videoLink = element(by.id('videoTutorial-lnk'));

  this.headerSearch = element(by.css('.header-search'));
  this.settingsMenu = element(by.css('.settings-menu .dropdown-toggle'));
  this.planReview = element(by.cssContainingText('.settings-menu .dropdown-menu a', 'Plan Review'));
  this.addUsers = element(by.cssContainingText('.settings-menu .dropdown-menu a', 'Add Users'));
  this.communication = element(by.cssContainingText('.settings-menu .dropdown-menu a', 'Call'));
  this.messaging = element(by.cssContainingText('.settings-menu .dropdown-menu a', 'Message'));
  this.enterpriseSettings = element(by.cssContainingText('.settings-menu .dropdown-menu a', 'Enterprise Settings'));
  this.userInfo = element(by.css('.user-info'));
  this.launchPartnerButton = element(by.css('#launch-partner-btn a'));

  this.clickDevelopmentTab = function () {
    utils.click(this.developmentTab);
  };

  this.clickCDRSupport = function () {
    this.clickDevelopmentTab();
    utils.click(this.cdrTab);
  }

  this.clickServicesTab = function () {
    utils.click(this.servicesTab);
  };

  this.clickMediaFusionManagement = function () {
    this.clickServicesTab();
    utils.click(this.mediaFusionMgmtTab);
    this.expectCurrentUrl('/mediafusionconnector');
  };

  this.clickHome = function () {
    utils.click(this.homeTab);
    this.expectCurrentUrl('/overview');
  };

  this.clickOrganization = function () {
    this.clickDevelopmentTab();
    utils.click(this.orgTab);
    this.expectCurrentUrl('/organizations');
  };

  this.clickCustomers = function () {
    utils.click(this.customersTab);
    this.expectCurrentUrl('/customers');
  };

  this.clickUsers = function () {
    utils.click(this.usersTab);
    this.expectCurrentUrl('/users');
  };

  this.clickDevices = function () {
    utils.click(this.devicesTab);
    this.expectCurrentUrl('/devices');
  };

  this.clickCallRouting = function () {
    this.clickDevelopmentTab();
    utils.click(this.callRoutingTab);
    this.expectCurrentUrl('/callrouting');
  };

  this.clickAutoAttendant = function () {
    this.clickDevelopmentTab();
    utils.click(this.callRoutingTab);
    utils.click(this.autoAttendantPage);
    this.expectCurrentUrl('/features');
    utils.expectIsDisplayed(autoattendant.newFeatureButton);
  };

  this.clickReports = function () {
    utils.click(this.reportsTab);
    this.expectCurrentUrl('/reports');
  };

  this.clickSupport = function () {
    utils.click(this.supportTab);
    this.expectCurrentUrl('/support');
  };

  this.clickFusion = function () {
    this.clickServicesTab();
    utils.click(this.fusionTab);
    this.expectCurrentUrl('/fusion');
  };

  this.clickMeetings = function () {
    this.clickDevelopmentTab();
    utils.click(this.meetingsTab);
    this.expectCurrentUrl('/meetings');
  };

  this.clickEnterpriseResource = function () {
    this.clickDevelopmentTab();
    utils.click(this.enterpriseResourcesTab);
    this.expectCurrentUrl('/vts');
  };

  this.clickUtilization = function () {
    this.clickDevelopmentTab();
    utils.click(this.utilizationTab);
    this.expectCurrentUrl('/utilization');
  };

  this.clickFirstTimeWizard = function () {
    utils.click(this.settingsMenu);
    utils.click(this.planReview);
  };

  this.clickAddUsers = function () {
    utils.click(this.settingsMenu);
    utils.click(this.addUsers);
  };

  this.clickCommunicationWizard = function () {
    utils.click(this.settingsMenu);
    utils.click(this.communication);
  };

  this.clickMessagingSetup = function () {
    utils.click(this.settingsMenu);
    utils.click(this.messaging);
  };

  this.clickEnterpriseSettings = function () {
    utils.click(this.settingsMenu);
    utils.click(this.enterpriseSettings);
  };

  this.clickOrgProfile = function () {
    utils.click(this.accountTab);
  };

  this.getTabCount = function () {
    return this.tabCount.then(function (tabs) {
      return tabs.length;
    });
  };

  this.expectCurrentUrl = function (url) {
    return browser.wait(function () {
      return browser.getCurrentUrl().then(function (currentUrl) {
        return currentUrl.indexOf(url) !== -1;
      });
    }, TIMEOUT);
  };

  this.expectDriverCurrentUrl = function (url, url2) {
    return browser.wait(function () {
      return browser.driver.getCurrentUrl().then(function (currentUrl) {
        log('Expecting ' + currentUrl + ' to contain ' + url + ' or ' + url2);
        return currentUrl.indexOf(url) !== -1 || currentUrl.indexOf(url2) !== -1;
      });
    }, TIMEOUT);
  };

  this.expectAdminSettingsNotDisplayed = function () {
    utils.expectIsNotDisplayed(this.tabs);
    utils.expectIsNotDisplayed(this.userInfo);
    utils.expectIsNotDisplayed(this.headerSearch);
    utils.expectIsNotDisplayed(this.settingsMenu);
  };

  this.hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
      return classes.split(' ').indexOf(cls) !== -1;
    });
  };

  this.logout = function () {
    utils.click(this.userInfoButton);
    utils.click(this.logoutButton);
    this.expectDriverCurrentUrl('/login', 'idbroker.webex.com');

  };

  this.sendFeedback = function () {
    utils.click(this.userInfoButton);
    utils.click(this.feedbackLink);
  };

  this.support = function () {
    utils.click(this.userInfoButton);
    utils.click(this.supportLink);
  }

  this.videoTutorial = function () {
    utils.click(this.userInfoButton);
    utils.click(this.videoLink);
  }

  this.launchPartnerOrgPortal = function () {
    utils.click(this.userInfoButton);
    utils.click(this.launchPartnerButton);
  };

  this.ensureHybridService = function (page) {
    this.clickServicesTab();
    utils.click(page);
    utils.wait(navigation.serviceSettings).then(function () {
      console.log('\tSettings page should show "Deactivate" button');
      utils.click(navigation.serviceSettings);
      utils.expectIsDisplayed(navigation.deactivateService);
    }, function () {
      console.log('\tSevice disabled, enabling it...');
      utils.click(navigation.activateService);
      utils.click(navigation.serviceSettings);
      utils.expectIsDisplayed(navigation.deactivateService);
    });
  }
};

module.exports = Navigation;
