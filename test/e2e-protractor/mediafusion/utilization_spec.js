'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  superUser: 'super-admin@mfusion1webex.com',
  superUserPasswd: 'Mc23267!',
  searchStr: 'Cloud'
    //searchStr: 'Fake'
};

// Notes:
// - State is conserved between each despribe and it blocks.
// - When a page is being loaded, use wait() to check if elements are there before asserting.

describe('utilization flow', function () {
  beforeEach(function () {
    this.addMatchers({
      toBeLessThanOrEqualTo: function () {
        return {
          compare: function (actual, expected) {
            return {
              pass: actual < expected || actual === expected,
              message: 'Expected ' + actual + 'to be less than or equal to ' + expected
            };
          }
        };
      }
    });
    utils.scrollTop();
  });

  it('Should login as super admin', function () {
    login.login(testuser.superUser, testuser.superUserPasswd);
  });

  // Asserting listing meetings and pagination.
  describe('Listing overall and bridge by bridge utilization on page load', function () {
    it('Clicking on meetings tab should change the view', function () {
      navigation.clickUtilization();
    });

    it('Should list more than 0 bridge by bridge utilization', function () {
      utilization.assertAtleastOneResource();
    });

    it('bridge by bridge utilization value should be greater then 0', function () {
      utilization.assertResourceUtilizationGtZero();
    });

    it('bridge by bridge utilization value should be lesser then 100', function () {
      utilization.assertResourceUtilizationLsHundred();
    });

    it('Overall utilization value should be greater then 0', function () {
      utilization.assertAvgResourceUtilizationGtZero();
    });

    it('Overall utilization value should be lesser then 100', function () {
      utilization.assertAvgResourceUtilizationLsHundred();
    });

  });

  // Asserting feedback page launch
  describe('Launch feedback page', function () {
    it('Click feedback and launch form page', function () {
      browser.driver.manage().window().setSize(1195, 569);

      //Store the current window handle
      var winHandleBefore = browser.getWindowHandle();

      navigation.userInfoButton.click();
      utils.click(navigation.feedbackLink);
      browser.sleep(2000);

      browser.getAllWindowHandles().then(function (handles) {
        expect(handles.length).toEqual(2);
        var newWindowHandle = handles[1];
        browser.switchTo().window(newWindowHandle);
        browser.driver.close();
        browser.switchTo().window(winHandleBefore);
      });

      browser.driver.manage().window().maximize();
    });
  });

  // Logout super admin user
  describe('Logout', function () {
    it('Should log out', function () {
      navigation.logout();
    });
  });
});
