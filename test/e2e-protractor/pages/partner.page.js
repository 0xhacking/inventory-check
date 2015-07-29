'use strict';

var PartnerHomePage = function () {

  var randomNumber = utils.randomId();

  this.newTrial = {
    customerName: 'Atlas_Test_Trial_' + randomNumber,
    customerEmail: 'collabctg+Atlas_Test_Trial_' + randomNumber + '@gmail.com'
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
    two: utils.randomDid()
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
  this.customerNameInput = element(by.id('customerName'));
  this.didNumberSpan = element(by.id('didNumberSpan'));
  this.didAddModal = element(by.id('didAddModal'));
  this.addDidButton = element(by.id('addDidButton'));
  this.removeDidPanel = element(by.id('removeDidPanel'));
  this.removeDidButton = element(by.id('removeDidButton'));
  this.addDidDismissButton = element(by.id('addDidDismissButton'));
  this.notifyCustLaterLink = element(by.id('notifyCustLaterLink'));
  this.customerDidAdd = element(by.css('.did-input .tokenfield'));
  this.customerDidInput = element(by.id('didAddField-tokenfield'));
  this.customerEmailInput = element(by.id('customerEmail'));
  this.licenseCount = element(by.id('licenseCount'));
  this.licenseDuration = element(by.id('licenseDuration'));
  this.editTrialButton = element(by.id('editTrialButton'));
  this.newTrialName = element(by.binding('trial.'));
  this.saveSendButton = element(by.id('saveSendButton'));
  this.saveUpdateButton = element(by.id('saveUpdateButton'));
  this.newTrialRow = element(by.id(this.newTrial.customerName));
  this.newSqUCTrialRow = element(by.id(this.newSqUCTrial.customerName));
  this.editTrialForm = element(by.id('editTrialForm'));
  this.editLink = element(by.id('editLink'));
  this.editDidLink = element(by.id('editDidLink'));
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
  this.previewPanel = element(by.id('entire-slide'));
  this.customerInfo = element(by.id('customer-info'));
  this.trialInfo = element(by.id('trial-info'));
  this.actionsButton = element(by.id(this.newTrial.customerName + 'ActionsButton'));
  this.launchCustomerButton = element(by.id(this.newTrial.customerName + 'LaunchCustomerButton')).element(by.tagName('a'));
  this.launchCustomerPanelButton = element(by.id('launchCustomer'));
  this.exitPreviewButton = element(by.id('exitPreviewButton'));
  this.partnerFilter = element(by.id('partnerFilter'));
  this.trialFilter = element(by.cssContainingText('.filter', 'Trial'));
  this.partnerEmail = element.all(by.binding('userName'));
  this.squaredTrialCheckbox = element(by.css('label[for="squaredTrial"]'));
  this.squaredUCTrialCheckbox = element(by.css('label[for="squaredUCTrial"]'));
  this.customerNameHeader = element(by.cssContainingText('.ngHeaderText ', 'Customer Name'));

  this.viewAllLink = element(by.id('viewAllLink'));
  this.customerList = element(by.id('customerListPanel'));

  this.adminCustomerOrgId = element(by.css('div[orgid="' + this.csrole.adminOrgId + '"]'));
  this.regularCustomerOrgId = element(by.css('div[orgid="' + this.csrole.regularOrgId + '"]'));

  this.assertDisabled = function (id) {
    expect(element(by.id(id)).isEnabled()).toBeFalsy();
  };

  this.assertResultsLength = function () {
    element.all(by.binding('row.entity')).then(function (rows) {
      expect(rows.length).toBeGreaterThan(1);
    });
  };

  this.retrieveOrgId = function (trialRow) {
    return trialRow.getAttribute('orgId').then(function (orgId) {
      expect(orgId).not.toBeNull();
      return orgId;
    });
  };
};

module.exports = PartnerHomePage;
