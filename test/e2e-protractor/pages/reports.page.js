'use strict'

var ReportsPage = function(){
  this.entitlements = element(by.id('avgEntitlementsdiv'));
  this.calls = element(by.id('avgCallsdiv'));
  this.conversations = element(by.id('avgConversationsdiv'));
  this.activeUsers = element(by.id('activeUsersdiv'));

  this.entitlementsRefresh = element(by.id('avg-entitlements-refresh'));
  this.callsRefresh = element(by.id('avg-calls-refresh'));
  this.conversationsRefresh = element(by.id('avg-conversations-refresh'));
  this.activeUsersRefresh = element(by.id('active-users-refresh'));

  this.refreshButton = element(by.id('refreshButton'));
  this.refreshData = element(by.id('reportsRefreshData'));
  this.reloadedTime = element(by.id('lastReloadedTime'));
}

module.exports = ReportsPage;