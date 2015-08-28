'use strict';

// TODO - break up into UserList/UserAdd/UserPreview
var UsersPage = function () {
  this.inviteTestUser = {
    username: 'pbr-org-admin@squared2webex.com',
    password: 'C1sc0123!',
    usernameWithNoEntitlements: 'collabctg+doNotDeleteTestUser@gmail.com'
  };

  this.testUser = {
    username: 'atlasmapservice+ll1@gmail.com',
    password: 'C1sc0123!',
  };

  this.huronTestUser = {
    username: 'admin@int1.huron-alpha.com',
    password: 'Cisco123!',
  };

  this.accountTestUser = {
    username: 'nkamboh+acc2@gmail.com',
    password: 'C1sc0123!',
  };

  this.servicesPanel = element(by.cssContainingText('.section-title-row', 'Services'));
  this.servicesActionButton = this.servicesPanel.element(by.css('button.actions-button'));
  this.editServicesButton = element(by.cssContainingText('a', 'Edit services'));

  this.servicesPanelCommunicationsCheckbox = element(by.css('.bucket-row-inner .indentedCheckbox'));
  this.listPanel = element(by.id('userslistpanel'));
  this.manageDialog = element(by.id('modalContent'));
  this.deleteUserModal = element(by.id('deleteUserModal'));
  this.squaredPanel = element(by.id('conversations-link'));
  this.entitlementPanel = element(by.id('entitlementPanel'));
  this.conferencePanel = element(by.id('conferencePanel'));
  this.endpointPanel = element(by.id('endpointPanel'));
  this.previewPanel = element(by.id('details-panel'));
  this.previewName = element(by.id('name-preview'));
  this.assignServices = element(by.css('.license-wrapper'));

  this.nextButton = element(by.id('next-button'));
  this.rolesPanel = element(by.id('roles-panel'));
  this.closeRolesPanel = element(by.id('close-roles'));
  this.closeSidePanel = element(by.css('.panel-close'));
  this.messagingService = element(by.css('#Messaging .feature-arrow'));
  this.communicationsService = element(by.css('#Communications .feature-arrow'));
  this.conferencingService = element(by.css('#Conferencing .feature-arrow'));
  this.contactCenterService = element(by.css('#ContactCenter .feature-arrow'));
  this.serviceList = element.all(by.model('service in userOverview.services'));

  this.addUsers = element(by.id('addUsers'));
  this.addUsersField = element(by.id('usersfield-tokenfield'));
  this.closeAddUsers = element(by.id('closeAddUser'));
  this.invalid = element(by.css('.invalid'));
  this.close = element(by.css('.close'));

  this.emailAddressRadio = element(by.cssContainingText("span", "Email address"));
  this.nameAndEmailRadio = element(by.cssContainingText("span", "Names and Email address"));
  this.firstName = element(by.id('firstName'));
  this.lastName = element(by.id('lastName'));
  this.emailAddress = element(by.id('emailAddress'));
  this.plusIcon = element(by.css('.plus-icon-active'));

  this.manageCallInitiation = element(by.css('label[for="chk_squaredCallInitiation"]')); // on add users
  this.manageSquaredTeamMember = element(by.css('label[for="chk_squaredTeamMember"]'));
  this.callInitiationCheckbox = element(by.css('label[for="chk_squaredCallInitiation"]')); // on edit user
  this.messengerCheckBox = element(by.css('label[for="chk_jabberMessenger"]'));
  this.messengerInteropCheckbox = element(by.css('label[for="chk_messengerInterop"]'));
  this.fusionCheckBox = element(by.css('label[for="chk_squaredFusionUC"]'));
  this.squaredCheckBox = element(by.css('label[for="chk_webExSquared"]'));
  this.squaredUCCheckBox = element(by.css('label[for="chk_ciscoUC"]'));
  this.closePreview = element(by.id('exitPreviewButton'));
  this.closeDetails = element(by.id('exit-details-btn'));

  this.standardTeamRooms = element(by.cssContainingText('label', 'Standard Team Rooms'));
  this.advancedCommunications = element(by.cssContainingText('label', 'Advanced Spark Call'));

  this.subTitleAdd = element(by.id('subTitleAdd'));
  this.subTitleEnable = element(by.id('subTitleEnable'));

  this.onboardButton = element(by.id('btnOnboard'));
  this.inviteButton = element(by.id('btnInvite'));
  this.entitleButton = element(by.id('btnEntitle'));
  this.addButton = element(by.id('btnAdd'));
  this.deleteUserButton = element(by.id('deleteUserButton'));
  this.inputYes = element(by.id('inputYes'));

  this.cancelButton = element(by.buttonText('Cancel'));
  this.saveButton = element(by.buttonText('Save'));

  this.clearButton = element(by.id('btnClear'));
  this.backButton = element(by.buttonText('Clear'));
  this.nextButton = element(by.buttonText('Next'));

  this.currentPage = element(by.css('.pagination-current a'));
  this.queryCount = element(by.binding('totalResults'));
  this.nextPage = element(by.id('next-page'));
  this.prevPage = element(by.id('prev-page'));
  this.queryResults = element(by.id('queryresults'));

  this.moreOptions = element(by.id('userMoreOptions'));
  this.settingsBar = element(by.id('setting-bar'));
  this.exportButton = element(by.id('export-btn'));
  this.logoutButton = element(by.id('logout-btn'));
  this.userNameCell = element(by.id('userNameCell'));
  this.checkBoxEnts = element.all(by.repeater('key in entitlementsKeys'));
  this.iconSearch = element(by.id('icon-search'));
  this.userListEnts = element.all(by.binding('userName'));
  this.userListStatus = element.all(by.binding('userStatus'));
  this.userListDisplayName = element.all(by.binding('displayName'));
  this.userListAction = element(by.id('actionsButton'));
  this.actionDropdown = element(by.css('.dropdown-menu'));
  this.resendInviteOption = element(by.css('#resendInviteOption a'));
  this.deleteUserOption = element(by.css('#deleteUserOption a'));
  this.gridCell = element(by.css('.ngCell'));
  this.userLink = element(by.id('user-profile'));

  this.fnameField = element(by.id('fnameField'));
  this.lnameField = element(by.id('lnameField'));
  this.displayField = element(by.id('displayField'));
  this.emailField = element(by.id('emailField'));
  this.orgField = element(by.id('orgField'));
  this.titleField = element(by.id('titleField'));
  this.userTab = element(by.id('usertab'));

  this.collabRadio1 = element(by.id('collabRadioLabel1'));
  this.collabRadio2 = element(by.id('collabRadioLabel2'));

  this.rolesChevron = element(by.css('#rolesChevron .header-title'));
  this.headerOrganizationName = element(by.css('.navbar-orgname'));
  this.messageLicenses = element(by.id('messaging'));
  this.conferenceLicenses = element(by.id('conference'));
  this.communicationLicenses = element(by.id('communication'));

  this.internalNumber = element(by.css('.select-list[name="internalNumber"] a.select-toggle'));
  this.internalNumberOptionFirst = element(by.css('.select-list[name="internalNumber"]')).all(by.repeater('option in csSelect.options')).first().element(by.tagName('a'));
  this.internalNumberOptionLast = element(by.css('.select-list[name="internalNumber"]')).all(by.repeater('option in csSelect.options')).last().element(by.tagName('a'));
  this.externalNumber = element(by.css('.select-list[name="externalNumber"] a.select-toggle'));
  this.externalNumberOptionLast = element(by.css('.select-list[name="externalNumber"]')).all(by.repeater('option in csSelect.options')).last().element(by.tagName('a'));
  this.mapDn = element(by.id('mapDn'));
  this.addDnAndExtToUser = element(by.id('addDnAndExtToUserOptionButtons'));

  this.selectedRow = element(by.css('[ng-repeat="row in renderedRows"].selected'));

  this.assertSorting = function (nameToSort) {
    this.queryResults.getAttribute('value').then(function (value) {
      var queryresults = parseInt(value, 10);
      if (queryresults > 1) {
        //get first user
        var user = null;
        element.all(by.repeater('user in queryuserslist')).then(function (rows) {
          user = rows[0].getText();
        });
        //Click on username sort and expect the first user not to be the same
        element(by.id(nameToSort)).click().then(function () {
          element.all(by.repeater('user in queryuserslist')).then(function (rows) {
            expect(rows[0].getText()).not.toBe(user);
          });
        });
      }
    });
  };

  this.retrieveInternalNumber = function () {
    utils.wait(this.internalNumber);
    return this.internalNumber.evaluate('csSelect.selected.pattern');
  };

  this.retrieveExternalNumber = function () {
    utils.wait(this.externalNumber);
    return this.externalNumber.evaluate('csSelect.selected.pattern');
  };

  this.clickOnUser = function () {
    utils.click(element.all(by.repeater('row in renderedRows')).first().all(by.repeater('col in renderedColumns')).first());
  };

  this.assertPage = function (page) {
    utils.expectText(this.currentPage, page);
  };

  this.assertResultsLength = function (results) {
    element.all(by.repeater('row in renderedRows')).then(function (rows) {
      if (results === 20) {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };

  this.returnUser = function (userEmail) {
    return element.all(by.cssContainingText('.col3', userEmail)).first();
  };

  this.assertEntitlementListSize = function (size) {
    element.all(by.repeater('key in entitlementsKeys')).then(function (items) {
      expect(items.length).toBe(size);
    });
  };

  this.retrieveCurrentUser = function () {
    return this.selectedRow.evaluate('currentUser').then(function (currentUser) {
      expect(currentUser).not.toBeNull();
      return currentUser;
    });
  };

};

module.exports = UsersPage;
