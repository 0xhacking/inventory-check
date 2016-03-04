'use strict';

var LoginPage = function () {

  var unauthorizedTitle = element(by.cssContainingText('.message-box__title ', 'Unauthorized'));
  this.emailField = element(by.css('[name="email"]'));
  this.setLoginUsername = function (username) {
    browser.driver.findElement(by.id('IDToken1')).sendKeys(username);
  };
  this.clickLoginNext = function () {
    browser.driver.findElement(by.id('IDButton2')).click();
  };
  this.setLoginPassword = function (password) {
    browser.driver.findElement(by.id('IDToken2')).sendKeys(password);
  };
  this.clickLoginSubmit = function () {
    browser.driver.findElement(by.id('Button1')).click();
  };

  this.isLoginUsernamePresent = function () {
    return browser.driver.isElementPresent(by.id('IDToken1'));
  };
  this.isLoginPasswordPresent = function () {
    return browser.driver.isElementPresent(by.id('IDToken2'));
  };

  this.setSSOUsername = function (username) {
    browser.driver.findElement(by.id('username')).sendKeys(username);
  };
  this.setSSOPassword = function (password) {
    browser.driver.findElement(by.id('password')).sendKeys(password);
  };
  this.clickSSOSubmit = function () {
    browser.driver.findElement(by.css('button[type="submit"]')).click();
  };
  this.isLoginSSOPresent = function () {
    return browser.driver.isElementPresent(by.id('username')) && browser.driver.isElementPresent(by.id('password'));
  };

  this.assertLoginError = function (msg) {
    expect(browser.driver.findElement(by.css('.generic-error')).getText()).toContain(msg);
  };

  this.loginButton = element(by.cssContainingText('button[role="button"]', 'Sign In'));

  this.clickLoginButton = function () {
    this.loginButton.click();
  };

  this.login = function (username, expectedUrl, opts) {
    var bearer;
    var method = opts && opts.navigateToUsingIntegrationForTesting ? 'navigateToUsingIntegrationForTesting' : 'navigateTo';
    navigation[method](expectedUrl);
    helper.getBearerToken(username, function (_bearer) {
      bearer = _bearer;
      expect(bearer).not.toBeNull();
      navigation.expectDriverCurrentUrl('/login').then(function () {
        browser.executeScript("localStorage.accessToken='" + bearer + "'");
        browser.refresh();
        navigation.expectDriverCurrentUrl(typeof expectedUrl !== 'undefined' ? expectedUrl : '/overview');
      });
    });
    return browser.wait(function () {
      return bearer;
    }, 10000, 'Could not retrieve bearer token to login');
  };

  this.loginUsingIntegrationForTesting = function (username, expectedUrl) {
    return this.login(username, expectedUrl, {
      navigateToUsingIntegrationForTesting: true
    });
  };

  this.loginUnauthorized = function (username, expectedUrl) {
    var bearer;
    navigation.navigateTo(expectedUrl);
    helper.getBearerToken(username, function (_bearer) {
      bearer = _bearer;
      expect(bearer).not.toBeNull();
      navigation.expectDriverCurrentUrl('/login').then(function () {
        browser.executeScript("localStorage.accessToken='" + bearer + "'");
        browser.refresh();
        utils.expectIsDisplayed(unauthorizedTitle);
      });
    });
    return browser.wait(function () {
      return bearer;
    }, 10000, 'Could not retrieve bearer token to login');
  };

  this.loginThroughGui = function (username, password, expectedUrl) {
    navigation.navigateToUsingIntegrationForTesting(expectedUrl || '#/login');
    utils.sendKeys(this.emailField, username);
    utils.click(this.loginButton);
    browser.driver.wait(this.isLoginPasswordPresent, TIMEOUT);
    this.setLoginPassword(password);
    this.clickLoginSubmit();
    navigation.expectDriverCurrentUrl(typeof expectedUrl !== 'undefined' ? expectedUrl : '/overview');
  };

};

module.exports = LoginPage;
