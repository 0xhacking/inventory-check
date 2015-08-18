'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Invite User and Check Buckets', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  //log in as admin with an account
  describe('Account Add User', function () {
    var addEmail = utils.randomTestGmail();

    it('should login and view users', function () {
      login.login('account-admin', '#/users');
    });

    it('click on add button should pop up the adduser modal and display only invite button', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

    describe('Add users', function () {
      it('should clear user input field and error message', function () {
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.clearButton);
        utils.expectTextToBeSet(users.addUsersField, '');
        utils.expectIsEnabled(users.nextButton);
      });

      it('click on enable services individually', function () {
        utils.sendKeys(users.addUsersField, addEmail);
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.nextButton);
        utils.expectIsDisplayed(users.messageLicenses);
        utils.expectIsDisplayed(users.conferenceLicenses);
        utils.expectIsDisplayed(users.communicationLicenses);
      });

      it('should add users successfully', function () {
        utils.click(users.onboardButton);
        notifications.assertSuccess(addEmail, 'onboarded successfully');
        notifications.clearNotifications();
        utils.expectIsNotDisplayed(users.manageDialog);
      });
    });

    describe('Delete user used for entitle test', function () {
      it('should delete added user', function () {
        deleteUtils.deleteUser(addEmail);
      });
    });

    it('should log out', function () {
      navigation.logout();
    });
  });
});
