'use strict';

describe('WebEx user settings', function () {
  var setup = false;

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  beforeAll(function () {
    var promise = webEx.setup(usersettings.testAdmin.username, usersettings.testAdmin.password, usersettings.testSiteUrl);
    promise.then(function (ticket) {
      if (ticket) {
        setup = true;
      }
    });
  });

  /**  
    xit('should allow login as admin user', function () {
      login.loginThroughGui(usersettings.testAdmin.username, usersettings.testAdmin.password);
    });
  **/
  it('click on users tab', function () {
    navigation.clickUsers();
  });

  it('should allow search and click on user', function () {
    utils.searchAndClick(usersettings.testUser.username);
  });

  it('should allow click on conferencing', function () {
    utils.wait(users.conferencingService);
    expect(users.conferencingService.isPresent()).toBeTruthy();
    utils.click(users.conferencingService);
  });

  it('should allow click on site name', function () {
    if (setup) {
      utils.wait(usersettings.testSiteElement);
      expect(usersettings.testSiteElement.isPresent()).toBeTruthy();
      utils.click(usersettings.testSiteElement);
    }
  });

  it('should display basic WebEx settigns page', function () {
    if (setup) {
      utils.wait(usersettings.userSettingsPanel);
      expect(usersettings.userSettingsPanel.isPresent()).toBeTruthy();
      expect(usersettings.userSettingsPanel.isDisplayed()).toBeTruthy();
    }
  });

  it('should not display WebEx error page', function () {
    if (setup) {
      expect(usersettings.errorPanel.isPresent()).toBeFalsy();
    }
  });

  it('should allow navigation to the 4th panel', function () {
    if (setup) {
      utils.click(usersettings.userPrivilegesLink);
      utils.wait(usersettings.userPrivilegesPanel);
      expect(usersettings.userPrivilegesPanel.isPresent()).toBeTruthy();
      expect(usersettings.userPrivilegesPanel.isDisplayed()).toBeTruthy();
    }
  });

  it('should allow navigation back to the 3rd panel', function () {
    if (setup) {
      utils.clickLastBreadcrumb();
      expect(usersettings.userSettingsPanel.isPresent()).toBeTruthy();
      expect(usersettings.userSettingsPanel.isDisplayed()).toBeTruthy();
    }
  });

  it('should not show save button without any changes', function () {
    if (setup) {
      expect(usersettings.saveButton.isPresent()).toBeFalsy();
    }
  });

  it('should allow edit in 3rd panel', function () {
    if (setup) {
      expect(usersettings.mcAuoCheckbox.isPresent());
      usersettings.mcAuo.click();
      expect(usersettings.saveButton.isPresent()).toBeTruthy();
    }
  });

  it('should allow save in 3rd panel', function () {
    if (setup) {
      usersettings.save();
    }
    //    expect(usersettings.alertSuccess.isDisplayed()).toBeTruthy();
  });

  xit('should allow edit in 4th panel', function () {
    utils.click(usersettings.userPrivilegesLink);
    utils.wait(usersettings.userPrivilegesPanel);
    expect(usersettings.userPrivilegesPanel.isPresent()).toBeTruthy();
    expect(usersettings.userPrivilegesPanel.isDisplayed()).toBeTruthy();
    if (usersettings.userPrivilegesPanel.telephonyPrivileges.isPresent()) {
      expect(usersettings.callInTeleconfCheckbox.isPresent());
    }

  });

  xit('should not allow save of mc AUO without mc PRO', function () {
    if (usersettings.mc.isPresent() && usersettings.mc.isDisplayed()) {
      usersettings.unSelectAllMcSessionTypeByPrefix('PRO');
      usersettings.selectAllMcSessionTypeByPrefix('AUO');
      expect(usersettings.saveButton.isDisplayed()).toBeTruthy();
      usersettings.save();
      expect(usersettings.alertError.isDisplayed()).toBeTruthy();
      usersettings.alertError.click();
    }
  });

  xit('should allow save of mc AUO with mc PRO', function () {
    if (usersettings.mc.isPresent() && usersettings.mc.isDisplayed()) {
      usersettings.selectAllMcSessionTypeByPrefix('PRO');
      usersettings.selectAllMcSessionTypeByPrefix('AUO');
      expect(usersettings.saveButton.isDisplayed()).toBeTruthy();
      usersettings.save();
      expect(usersettings.alertSuccess.isDisplayed()).toBeTruthy();
      usersettings.alertSuccess.click();
    }
  });

  // it('should pause', function () {
  //   browser.pause();
  // });

  it('should allow log out', function () {
    navigation.logout();
  });
});
