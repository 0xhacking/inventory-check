'use strict';

var PartnerHomePage = function () {

  var randomNumber = utils.randomId();

  this.newTrial = {
    customerName: 'Atlas_Test_UI_' + randomNumber,
    customerEmail: 'collabctg+Atlas_Test_UI_' + randomNumber + '@gmail.com'
  };

  this.editTrial = {
    licenseCount: '90'
  };

  this.newSqUCTrial = {
    customerName: 'Atlas_Test_UC_' + randomNumber.slice(0, 5),
    customerEmail: 'collabctg+Atlas' + randomNumber.slice(0, 5) + '@gmail.com'
  };

  this.differentTrial = {
    customerName: 'collabctg+Atlas_Different',
    customerEmail: 'collabctg+Atlas_Different@gmail.com'
  };

  this.testuser = {
    username: 'atlaspartneradmin@atlas.test.com',
    password: 'C1sc0123!'
  };

  this.csrole = {
    adminOrgId: '9a65eda3-272a-4aca-ac28-c72cb34013e4',
    regularOrgId: 'c6b0e64c-908e-498e-a94e-5d3ae1e650ad'
  };

  this.dids = {
    one: utils.randomDid(),
    two: utils.randomDid(),
    three: utils.randomDid()
  };

  this.getDidTokenClose = function (did) {
    return element.all(by.css('.token')).filter(function (elem, index) {
      return elem.element(by.css('.token-label')).getText().then(function (text) {
        return text === utils.formatPhoneNumbers(did);
      });
    }).first().element(by.css('.close'));
  };

  this.trialsPanel = element(by.id('trialsPanel'));
  this.addButton = element(by.id('addTrial'));
  this.startTrialButton = element(by.id('startTrialButton'));
  this.startTrialWithSqUCButton = element(by.id('startTrial'));
  this.trialDoneButton = element(by.id('trialDone'));
  this.customerNameInput = element(by.id('input_customerName'));
  this.didAddModal = element(by.id('didAddModal'));
  this.addDidButton = element(by.id('addDidButton'));
  this.removeDidPanel = element(by.id('removeDidPanel'));
  this.removeDidButton = element(by.id('removeDidButton'));
  this.addDidDismissButton = element(by.id('addDidDismissButton'));
  this.notifyCustLaterLink = element(by.id('notifyCustLaterLink'));
  this.customerDidAdd = element(by.css('.did-input .tokenfield'));
  this.customerDidInput = element(by.id('didAddField-tokenfield'));
  this.customerEmailInput = element(by.id('input_customerEmail'));
  this.licenseCount = element(by.id('licenseCount'));
  this.licenseCountInput = element(by.id('input_licenseCount'));
  this.trialRoomSystemsAmount = element(by.id('trialRoomSystemsAmount'));
  this.licenseDuration = element(by.id('licenseDuration'));
  this.editTrialButton = element(by.id('editTrialButton'));
  this.newTrialName = element(by.binding('trial.'));
  this.saveSendButton = element(by.id('saveSendButton'));
  this.saveUpdateButton = element(by.id('saveUpdateButton'));
  this.newTrialRow = element(by.cssContainingText('.ui-grid-cell', this.newTrial.customerName));
  this.newSqUCTrialRow = element(by.cssContainingText('.ui-grid-cell', this.newSqUCTrial.customerName));
  this.editTrialForm = element(by.id('editTrialForm'));
  this.addTrialForm = element(by.id('addTrialForm'));
  this.cancelTrialButton = element(by.id('cancelNewTrialButton'));
  this.customerNameForm = element(by.id('customerNameForm'));
  this.customerEmailForm = element(by.id('customerEmailForm'));
  this.refreshButton = element(by.id('partnerRefreshData'));
  this.entitlementsChart = element(by.id('avgEntitlementsdiv'));
  this.entitlementsCount = element(by.binding('counts.entitlements'));
  this.activeUsersTab = element(by.cssContainingText('li a', 'Daily Active Users'));
  this.activeUsersChart = element(by.id('activeUsersdiv'));
  this.activeUsersCount = element(by.binding('counts.activeUsers'));
  this.averageCallsTab = element(by.cssContainingText('li a', 'Average Calls Per User'));
  this.averageCallsChart = element(by.id('avgCallsdiv'));
  this.averageCallsCount = element(by.binding('counts.averageCalls'));
  this.contentSharedTab = element(by.cssContainingText('li a', 'Files Shared'));
  this.contentSharedChart = element(by.id('contentShareddiv'));
  this.contentSharedCount = element(by.binding('counts.contentShared'));
  this.noResultsAvailable = element(by.cssContainingText('span', 'No results available'));
  this.errorProcessing = element(by.cssContainingText('span', 'Error processing request'));
  this.selectRow = element(by.binding('row.entity'));
  this.previewPanel = element(by.css('.customer-overview'));
  this.customerInfo = element(by.id('customer-info'));
  this.trialInfo = element(by.id('trial-info'));
  this.actionsButton = element(by.id(this.newTrial.customerName + 'ActionsButton'));
  this.launchCustomerButton = element(by.id(this.newTrial.customerName + 'LaunchCustomerButton')).element(by.tagName('a'));
  this.launchCustomerPanelButton = element(by.id('launchCustomer'));
  this.exitPreviewButton = element(by.css('.panel-close'));
  this.partnerFilter = element(by.id('partnerFilter'));
  this.trialFilter = element(by.cssContainingText('.filter', 'Trial'));
  this.allFilter = element(by.cssContainingText('.filter', 'All'));
  this.partnerEmail = element.all(by.binding('userName'));
  this.messageTrialCheckbox = element(by.css('label[for="messageTrial"]'));
  this.roomSystemsCheckbox = element(by.css('label[for="trialRoomSystem"]'));
  this.roomSystemsCheckboxChecked = element(by.css('label[for="trialRoomSystemsChecked"]'));
  this.squaredUCTrialCheckbox = element(by.css('label[for="squaredUCTrial"]'));
  this.customerNameHeader = element(by.cssContainingText('.ngHeaderText ', 'Customer Name'));
  this.myOrganization = element(by.id('partner'));
  this.launchButton = element(by.id('launchPartner'));
  this.skipCustomerSetup = element(by.id('trialNotifyCustomer'));
  this.closeBtnOnModal = element(by.css('button.close'));
  this.videoModal = element(by.id('videoId'));

  this.viewAllLink = element(by.id('viewAllLink'));
  this.customerList = element(by.id('customerListPanel'));

  this.adminCustomerOrgId = element(by.css('div[orgid="' + this.csrole.adminOrgId + '"]'));
  this.regularCustomerOrgId = element(by.css('div[orgid="' + this.csrole.regularOrgId + '"]'));

  this.termsOfTrialSection = element(by.cssContainingText('.section-title-row', 'Trial'));
  this.termsActionButton = this.termsOfTrialSection.element(by.css('button.actions-button'));
  this.editTermsButton = this.termsOfTrialSection.element(by.cssContainingText('a', 'Edit Trial'));

  this.communicationSection = element(by.css('.external-number-overview .side-panel-section'));
  this.communicationPhoneNumbers = element(by.cssContainingText('.feature', 'Phone Numbers'));
  this.communicationPhoneNumbersCount = this.communicationPhoneNumbers.element(by.css('.feature-status'));

  this.phoneNumbersSection = element(by.cssContainingText('.section-title-row', 'Phone Numbers'));
  this.phoneNumbersActionButton = this.phoneNumbersSection.element(by.css('button.actions-button'));
  this.addNumbersButton = this.phoneNumbersSection.element(by.cssContainingText('a', 'Add Numbers'));
  this.phoneNumbersTab = element(by.css('.external-number-detail .tab-pane.active'));
  this.phoneNumbersCount = this.phoneNumbersTab.element(by.css('.total-count'));
  this.clickPhoneNumberDelete = function (number) {
    utils.click(this.phoneNumbersTab.element(by.cssContainingText('.list-group-item', number)).element(by.css('.close')));
  };
  this.deleteNumberModal = element(by.cssContainingText('.modal-header', 'Delete Number'));
  this.deleteNumberYes = element(by.buttonText('Yes'));

  this.assertResultsLength = function () {
    element.all(by.binding('row.entity')).then(function (rows) {
      expect(rows.length).toBeGreaterThan(1);
    });
  };

  this.retrieveOrgId = function (trialRow) {
    return trialRow.evaluate('row.entity.customerOrgId').then(function (orgId) {
      expect(orgId).not.toBeNull();
      return orgId;
    });
  };

  this.isPaused = function () {
    return browser.executeScript(function () {
      return document.getElementById('videoId').paused;
    });
  };

  this.isPlay = function () {
    expect(partner.isPaused()).toBe(false);
  };

  this.playVideo = function () {
    browser.executeScript(function () {
      document.getElementById('videoId').play();
    });
  };

  this.videoLoadError = function () {
    return browser.executeScript(function () {
      return document.getElementById('videoId').onerror;
    });
  };

  this.videoLoads = function () {
    expect(partner.videoLoadError()).toBeNull();
  };
};

module.exports = PartnerHomePage;
