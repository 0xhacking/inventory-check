'use strict';

var AutoAttendantPage = function () {
  this.repeatMenu = 'Repeat this Menu';
  this.playSubmenu = 'Play Submenu';
  this.goBack = 'Go Back';
  this.routeToQueue = 'Queue Call';
  this.key0 = '0';
  this.key1 = '1';
  this.key2 = '2';
  this.firstTimeZone = 'Africa/Abidjan';

  this.routeQueueDetail = element(by.id('route-queue-detail'));
  this.rqDropDownOptions = element(by.id('route-queue-detail')).all(by.tagName('li'));
  this.phoneMenu = element(by.css('div.aa-panel-body[name="Phone Menu"]'));
  this.queueSetting = element(by.id('queueSetting'));
  this.queueMin = element(by.linkText('15'));
  this.queueMinOption = element(by.id('queueMin')).all(by.tagName('li'));
  this.okQueueTreatment = element(by.id('okTreatmentBtn'));
  this.mohCustomUpload = element(by.id('uploadFileRadio1'));
  this.mohDefaultUpload = element(by.id('musicOnHoldRadio1'));

  this.periodicMessageTypeSelect = element(by.id('periodicAnnouncement')).element(by.css('aa-message-type [name="messageInput"]'));
  this.periodicSayMessageOption = element(by.id('periodicAnnouncement')).element(by.css('select[name="messageSelect"] + div a.select-toggle'));
  this.periodicMediaUploadSelectOption = element(by.id('periodicAnnouncement')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.periodicMediaUploadInput = element(by.id('periodicAnnouncement')).element(by.css('aa-message-type [name="mediaUploadSend"]'));

  this.periodicMin = element(by.linkText('0'));
  this.periodicMinOption = element(by.id('periodicMinId')).all(by.tagName('li'));
  this.periodicSec = element(by.linkText('45'));
  this.periodicSecOption = element(by.id('periodicSecId')).all(by.tagName('li'));

  this.searchBox = element(by.id('searchFilter'));
  this.aaTitle = element(by.tagName('aa-builder-name-edit'));
  this.autoAttendantDevLink = element(by.css('a[href*="#/hurondetails/features"]'));
  this.newFeatureButton = element(by.css('.new-feature-button'));
  this.featureTypeAA = element(by.css('.feature-icon-color-AA'));
  this.basicAA = element(by.css('.icon-Basic'));
  this.customAA = element(by.css('.icon-Custom'));
  this.openClosedAA = element(by.css('.icon-BusinessHours'));
  this.newAAname = element(by.id('aa-name-detail'));
  this.addAANumbers = element(by.css('.aa-selected-phones .icon-chevron-down'));
  this.numberDropDownArrow = element(by.linkText('Search or Select a Number'));
  this.numberDropDownOptions = element(by.css(' .aa-selected-phones .select-options')).all(by.tagName('li'));
  this.saveButton = element(by.name('saveButton'));
  this.closeEditButton = element(by.id('close-panel'));
  this.testCardName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
  this.testCardClick = this.testCardName.element(by.xpath('ancestor::article')).element(by.css('.card-body'));
  this.testImportCardName = element(by.css('p[title="' + deleteUtils.testAAImportName + '"]'));
  this.testImportCardName = element(by.css('p[title="' + deleteUtils.testAAImportName + '"]'));

  this.testCardDelete = this.testCardName.element(by.xpath('ancestor::article')).element(by.css('.icon-trash'));
  this.testImportCardDelete = this.testImportCardName.element(by.xpath('ancestor::article')).element(by.css('.icon-trash'));
  this.aaCard = element(by.css('.card-body'));

  this.deleteModalConfirmText = element(by.css('.modal-body')).element(by.css('p'));

  this.deleteModalConfirmButton = element(by.id('deleteFeature'));

  this.lanesWrapper = element.all(by.css('div.aa-lanes-wrapper')).first();

  this.numberIconClose = element.all(by.css('.icon-close')).last();
  this.sayMessageBody = element(by.css('div.aa-panel-body[name="Say Message"]'));

  this.messageOptions = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="messageSelect"] + div a.select-toggle'));
  this.playMessageOption = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.sayMessageOption = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).last();

  this.dialByMessageOptions = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="messageSelect"] + div a.select-toggle'));
  this.dialByPlayMessageOption = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.dialBySayMessageOption = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).last();

  this.sayMediaUploadInput = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.name('mediaUploadInput'));

  this.dialByMediaUploadInput = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.name('mediaUploadInput'));

  this.mediaUploadSend = 'input[type="file"][name="mediaUploadSend"]';

  this.mediaFileToUpload = './../data/sample-media-upload.wav';

  this.deleteMedia = element(by.css('.delete-media a'));
  this.deleteConfirmationModalClose = element(by.css('.modal-footer')).element(by.cssContainingText('button', 'Delete'));

  this.sayMessage = element(by.css('div.aa-panel-body[name="Say Message"]'));
  this.sayMessageInput = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.name('messageInput'));
  this.sayMessageLanguage = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="languageSelect"] + div a.select-toggle'));
  this.languageDropDownOptions = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="languageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.sayMessageVoice = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="voiceSelect"] + div a.select-toggle'));
  this.sayMessageVoiceOptions = element(by.css('div.aa-panel-body[name="Say Message"]')).element(by.css('select[name="voiceSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.phoneMenuMessageOptions = element(by.css('div.aa-panel-body[name="Phone Menu"]')).element(by.css('select[name="messageSelect"] + div a.select-toggle'));

  this.phoneMenuPlayMessageOption = element(by.css('div.aa-panel-body[name="Phone Menu"]')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.phoneMenuSayMessageOption = element(by.css('div.aa-panel-body[name="Phone Menu"]')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).last();

  this.phoneMenuMediaUploadInput = element(by.css('div.aa-panel-body[name="Phone Menu"]')).element(by.name('mediaUploadInput'));
  this.phoneMenuAll = element.all(by.css('div.aa-panel-body[name="Phone Menu"]')).all(by.cssContainingText("h3", "Phone Menu"));
  this.phoneMenuSay = element.all(by.css('div.aa-panel-body[name="Phone Menu"] aa-message-type')).first();
  this.phonesayMessageInput = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-message-type [name="messageInput"]'));
  this.phonesayMessageLanguage = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message select[name="languageSelect"] + div a.select-toggle'));
  this.phonelanguageDropDownOptions = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message select[name="languageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.phonesayMessageVoice = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message select[name="voiceSelect"] + div a.select-toggle'));
  this.phonesayMessageVoiceOptions = element(by.css('div.aa-panel-body[name="Phone Menu"] aa-say-message select[name="voiceSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.addPlus = element(by.css('.aa-add-step-icon'));
  this.repeatPlus = element(by.name('aa-phone-menu-add-action'));
  this.phoneMenuKeys = element.all(by.css('div.aa-pm-key-select .icon-chevron-down'));
  this.phoneMenuKeysContent = element.all(by.css('div.aa-pm-key-select .select-toggle'));
  this.phoneMenuKeyOptions = element.all(by.css('div.aa-pm-key-select .dropdown-menu'));
  this.phoneMenuAction = element.all(by.css('div.aa-pm-action-select .icon-chevron-down'));
  this.phoneMenuActionContent = element.all(by.css('div.aa-pm-action-select .select-toggle'));
  this.phoneMenuActionOptions = element.all(by.css('div.aa-pm-action-select div.dropdown-menu'));
  this.phoneMenuActionTargets = element.all(by.css('div.aa-pm-action'));

  this.phoneMenuActionTargetsMessageOption = this.phoneMenuActionTargets.last().element(by.css('select[name="messageSelect"] + div a.select-toggle'));

  this.phoneMenuActionTargetMessageOptions = this.phoneMenuActionTargets.last().element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).last();

  this.callerInputFirst = element.all(by.css('div.aa-panel-body[name="Caller Input"]')).all(by.cssContainingText("h3", "Caller Input")).first();
  this.callerInputGetDigits = element(by.cssContainingText('cs-checkbox', 'Convert digit input to text string value'));
  this.callerInputTextFirst = element.all(by.name('callerInput')).first();
  this.callerInputNameVariable = element(by.name('callerInputNameVariable'));
  this.callerInputAddAction = element(by.name('aa-caller-input-add-action'));

  this.phoneMenuTimeout = element(by.css('div.aa-pm-timeout .icon-chevron-down'));
  this.phoneMenuTimeoutOptions = element(by.css('div.aa-pm-timeout div.dropdown-menu')).all(by.tagName('li')).first();
  this.submenuRepeatPlus = element.all(by.css('aa-submenu .icon-plus-circle'));
  this.submenuSayMessage = element.all(by.css('aa-say-message[name="aa-submenu-say-message"]'));
  this.submenuSayMessageHeaderFirst = element.all(by.css('aa-message-type[name="aa-msg-input-only"]')).get(0);
  this.submenuMessageOptionsFirst = element.all(by.css('aa-message-type[name="aa-msg-input-only"]')).get(0).element(by.css('select[name="messageSelect"] + div a.select-toggle'));
  this.submenuMessageOptionSelect = element.all(by.css('aa-message-type[name="aa-msg-input-only"]')).get(0).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li'));
  this.submenuKeys = function (submenuI) {
    return element.all(by.css('aa-submenu')).get(submenuI).all(by.css('div.aa-sm-key-select .icon-chevron-down'));
  }
  this.submenuKeysContent = function (submenuI) {
    return element.all(by.css('aa-submenu')).get(submenuI).all(by.css('div.aa-sm-key-select .select-toggle'));
  }
  this.submenuKeyOptions = function (submenuI) {
    return element.all(by.css('aa-submenu')).get(submenuI).all(by.css('div.aa-sm-key-select .dropdown-menu'));
  }
  this.submenuAction = function (submenuI) {
    return element.all(by.css('aa-submenu')).get(submenuI).all(by.css('div.aa-sm-action-select .icon-chevron-down'));
  }
  this.submenuActionContent = function (submenuI) {
    return element.all(by.css('aa-submenu')).get(submenuI).all(by.css('div.aa-sm-action-select .select-toggle'));
  }
  this.submenuActionOptions = function (submenuI) {
    return element.all(by.css('aa-submenu')).get(submenuI).all(by.css('div.aa-sm-action-select div.dropdown-menu'));
  }

  this.addStepFirst = element.all(by.css('div.aa-panel-round')).first();
  this.addStepLast = element.all(by.css('div.aa-panel-round')).last();

  this.addStep = function addStep(n) {
    return element.all(by.css('div.aa-panel-round')).get(n);
  }

  this.newStep = element.all(by.css('div.aa-panel[name="newStepForm"]')).filter(function (el) {
    return el.isDisplayed();
  });

  this.newStepMenu = element.all(by.css('div.aa-panel[name="newStepForm"]'))
    .filter(function (el) {
      return el.isDisplayed();
    })
  .first()
  .all(by.css("div.aa-flex-row"))
  .last();

  this.newStepForm = element.all(by.css('div.aa-panel[name="newStepForm"]')).first();
  this.newStepDropDownActionSelectopenHours0 = element(by.id('actionSelectopenHours0'));
  this.queueSettingsModal = element(by.css('div.aa-queue-settings-modal'));
  this.languageSelectopenHours0 = element(by.id('languageSelectopenHours0'));
  this.voiceSelectopenHours0 = element(by.id('voiceSelectopenHours0'));
  this.cancelTreatmentFeature = element(by.id('cancelTreatmentFeature'));

  // last item in newStep dropdown: Say Message
  this.newStepSelectSayMessage = element.all(by.css('div.aa-panel[name="newStepForm"]'))
    .filter(function (el) {
      return el.isDisplayed();
    })
    .first()
    .all(by.css("div.aa-flex-row"))
    .last()
    .all(by.tagName('li'))
    .get(4);

  // third item in newStep dropdown: Phone Menu
  this.newStepSelectPhoneMenu = element.all(by.css('div.aa-panel[name="newStepForm"]'))
    .filter(function (el) {
      return el.isDisplayed();
    })
    .first()
    .all(by.css("div.aa-flex-row"))
    .last()
    .all(by.tagName('li'))
    .get(2);

  // second item in newStep dropdown: Dial By Extension
  this.newStepSelectDialByExt = element.all(by.css('div.aa-panel[name="newStepForm"]'))
    .filter(function (el) {
      return el.isDisplayed();
    })
    .first()
    .all(by.css("div.aa-flex-row"))
    .last()
    .all(by.tagName('li'))
    .get(1);

  // fourth item in newStep dropdown: Route Call
  this.newStepSelectRouteCall = element.all(by.css('div.aa-panel[name="newStepForm"]'))
    .filter(function (el) {
      return el.isDisplayed();
    })
    .first()
    .all(by.css("div.aa-flex-row"))
    .last()
    .all(by.tagName('li'))
    .get(3);

  // first item is caller input
  this.newStepCallerInput = element.all(by.css('div.aa-panel[name="newStepForm"]'))
      .filter(function (el) {
        return el.isDisplayed();
      })
      .first()
      .all(by.css("div.aa-flex-row"))
      .last()
      .all(by.tagName('li'))
      .get(0)

  // since we added a Say Message via Add New Step, there should be more than 1 from now on.
  // Get them all so we can check:

  this.sayMessageAll = element.all(by.css('.aa-message-panel'));

  // and select the first one (which we added via Add New Step) for further tests
  this.sayMessageInputFirst = this.sayMessageAll.first().element(by.name('sayMessageInput'));

  // let's select galician (10th selection starting from 0 == 9) for a change of pace
  this.phoneLanguageDropDownOptionsTenth = this.phoneMenuSay.all(by.name('languageSelect'))
    .first()
    .element(by.css('div.dropdown-menu'))
    .all(by.tagName('li'))
    .get(9);

  this.routeCall = element(by.css('div.aa-panel-body[name="Route Call"]'));
  this.routeCallChoose = this.routeCall.element(by.css('div.dropdown'));
  this.routeExternal = this.routeCall.element(by.css('div.dropdown-menu')).all(by.tagName('li')).last();
  this.routeQueueCall = this.routeCall.element(by.css('div.dropdown-menu')).all(by.tagName('li')).get(0);
  this.routeExternalNumber = this.routeCall.element(by.css('input.phone-number'));

  this.dialByExtension = element(by.css('div.aa-panel-body[name="Dial by Extension"]'));

  this.dialByMessageOptions = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="messageSelect"] + div a.select-toggle'));

  this.dialBySayMessageOption = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="messageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).last();

  this.dialByMessageInput = element(by.css('div.aa-panel-body[name="Dial by Extension"] aa-message-type [name="messageInput"]'));
  this.dialByMessageLanguage = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="languageSelect"] + div a.select-toggle'));
  this.dialBylanguageDropDownOptions = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="languageSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.dialByMessageVoice = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="voiceSelect"] + div a.select-toggle'));
  this.dialByMessageVoiceOptions = element(by.css('div.aa-panel-body[name="Dial by Extension"]')).element(by.css('select[name="voiceSelect"] + div div.dropdown-menu')).all(by.tagName('li')).first();

  this.trash = element.all(by.css('.aa-trash-icon')).last();

  this.timeZone = element(by.name('aaScheduleModalCtrl.timeZoneForm'));
  this.firstTimeZoneElement = element(by.name('aaScheduleModalCtrl.timeZoneForm')).element(by.css('div.dropdown-menu')).all(by.tagName('li')).first();
  this.aaTimeZone = element(by.name('aaTimeZone'));
  this.schedule = element(by.css('.aa-schedule-container')).element(by.css('.aa-edit-icon'));
  this.addschedule = element(by.linkText('Add Hours'));
  this.toggleHolidays = element(by.css('a#toggleHolidays.icon.icon-right-arrow.pull-right'));
  this.addholiday = element(by.css('#addHoliday'));
  this.deleteHoliday = element(by.name('aaScheduleModalCtrl.holidaysForm')).all(by.css('i.icon-trash'));
  this.holidayName = element(by.css('#holidayName'));
  this.holidayName2 = element(by.css('div.content.active')).element(by.css('#holidayName'));
  this.recurAnnually = element.all(by.cssContainingText('.cs-checkbox', 'Recur Annually')).last();
  this.exactDate = element.all(by.cssContainingText('.cs-checkbox', 'Exact Date')).last();
  this.selectEvery = element(by.css('div.content.active')).element(by.css('select[name="month"] + div a.select-toggle'));
  this.selectEveryJanuary = element(by.css('div.content.active')).element(by.css('select[name="month"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.selectRank = element(by.css('div.content.active')).element(by.css('select[name="rank"] + div a.select-toggle'));
  this.selectRankFirst = element(by.css('div.content.active')).element(by.css('select[name="rank"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.selectDay = element(by.css('div.content.active')).element(by.css('select[name="day"] + div a.select-toggle'));
  this.selectDayMonday = element(by.css('div.content.active')).element(by.css('select[name="day"] + div div.dropdown-menu')).all(by.tagName('li')).first();
  this.selectdate = element(by.css('.calendar span:nth-child(15) .day'));
  this.date = element(by.css('cs-datepicker div.cs-datapicker-normal'));
  this.starttime = element(by.id('starttime0'));
  this.endtime = element(by.id('endtime0'));
  this.day1 = element(by.cssContainingText('cs-checkbox', 'Monday'));
  this.day2 = element(by.cssContainingText('cs-checkbox', 'Tuesday'));
  this.day3 = element(by.cssContainingText('cs-checkbox', 'Wednesday'));
  this.day4 = element(by.cssContainingText('cs-checkbox', 'Thursday'));
  this.day5 = element(by.cssContainingText('cs-checkbox', 'Friday'));
  this.day6 = element(by.cssContainingText('cs-checkbox', 'Saturday'));
  this.day7 = element(by.cssContainingText('cs-checkbox', 'Sunday'));
  this.holidayBehaviour = element(by.cssContainingText('.cs-checkbox', 'Holidays Follow Closed Behavior'));
  this.scheduletrash = element.all(by.css('.aa-schedule-trash')).first();
  this.modalsave = element(by.id('saveOpenClosedBtn'));
  this.modalcancel = element(by.id('cancelDeleteFeature'));
  this.scheduleCloseButton = element(by.css('.modal-header button.close'));

  this.openHoursLane = element(by.name('openLane')).element(by.name('openHours'));
  this.openHoursSayMessage = element(by.name('openLane')).element(by.css('div.aa-panel-body[name="Say Message"]'));
  this.openHoursPhoneMenu = element(by.name('openLane')).element(by.css('div.aa-panel-body[name="Phone Menu"]'));
  this.openHoursEndCall = element(by.name('openLane')).element(by.name('endCall'));
  this.selectOpenHoursBox = element(by.name('openHours'));
  this.selectHolidayHoursBox = element(by.name('holidays'));
  this.selectOpenCloseBar = element(by.name('hours-subtitle'));
  this.selectHolidaysBar = element(by.name('holidays-subtitle'));
  this.closedHoursLane = element(by.name('closedLane')).element(by.name('closedHours'));
  this.closedHoursSayMessage = element(by.name('closedLane')).element(by.css('div.aa-panel-body[name="Say Message"]'));
  this.closedHoursPhoneMenu = element(by.name('closedLane')).element(by.css('div.aa-panel-body[name="Phone Menu"]'));
  this.closedHoursEndCall = element(by.name('closedLane')).element(by.name('endCall'));
  this.scheduleInfoOpenHours = element(by.css('aa-schedule-info[schedule="openHours"]'));
  this.scheduleInfoClosedHours = element(by.css('aa-schedule-info[schedule="closedHours"]'));
  this.scheduleInfoHolidayHours = element(by.css('aa-schedule-info[schedule="holidays"]'));
  this.importSchedule = element(by.id('importSchedule'));
  this.importContinue = element(by.id('importCtn'));
  this.importScheduleTitle = element.all(by.cssContainingText('.modal-title', 'Copy Schedule'));
  this.assertUpdateSuccess = assertUpdateSuccess;
  this.assertCreateSuccess = assertCreateSuccess;
  this.assertImportSuccess = assertImportSuccess;
  this.assertCalendarUpdateSuccess = assertCalendarUpdateSuccess;
  this.assertDeleteSuccess = assertDeleteSuccess;
  this.scrollIntoView = scrollIntoView;

  function assertUpdateSuccess(test) {
    notifications.assertSuccess(test + ' updated successfully');
  }

  function assertCreateSuccess(test) {
    notifications.assertSuccess(test + ' created successfully');
  }

  function assertImportSuccess(hours, holidays) {
    notifications.assertSuccess("Copied " + hours + " Open Hours and " + holidays + " Holidays Successfully");
  }

  function assertCalendarUpdateSuccess(test) {
    notifications.assertSuccess('Calendar for ' + test + ' updated successfully');
  }

  function assertDeleteSuccess(test) {
    notifications.assertSuccess(test + ' Auto Attendant has been deleted successfully');
  }

  function scrollIntoView(el) {
    var webel = el.getWebElement();
    browser.executeScript(function (e) {
      e.scrollIntoView();
    }, webel);
  }

};

module.exports = AutoAttendantPage;
