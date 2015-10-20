'use strict';

angular.module('WebExReports').service('reportService', [
  '$q',
  '$log',
  '$translate',
  '$filter',
  'Authinfo',
  'WebExUtilsFact',
  'WebExXmlApiFact',
  'WebExXmlApiInfoSvc',
  'Notification',
  function (
    $q,
    $log,
    $translate,
    $filter,
    Authinfo,
    WebExUtilsFact,
    WebExXmlApiFact,
    webExXmlApiInfoObj,
    Notification
  ) {
    var self = this;

    var common_reports_pageids = ["meeting_in_progess", "meeting_usage",
      "recording_usage",
      "storage_utilization"
    ];

    var event_center_pageids = ["event_center_overview",
      "event_center_site_summary",
      "event_center_scheduled_events",
      "event_center_held_events",
      "event_center_report_template"
    ];

    var support_center_pageids = ["support_center_support_sessions",
      "support_center_call_volume",
      "support_center_csr_activity",
      "support_center_url_referral",
      "support_center_allocation_queue"
    ];

    var training_center_pageids = ["training_usage",
      "registration",
      "recording",
      "coupon",
      "attendee"
    ];

    var remote_access_pageids = ["remote_access_computer_usage",
      "remote_access_csrs_usage", "remote_access_computer_tracking"
    ];

    //This can be used for translations
    //Actually reverse mapping should be used for
    //translations.
    var pageid_to_navItemId_mapping = {
      "meeting_in_progess": "meetings_in_progress",
      "meeting_usage": "meeting_usage",
      "recording_usage": "recording_storage_usage",
      "storage_utilization": "storage_utilization_by_user",
      "event_center_overview": "ec_report_summary",
      "event_center_scheduled_events": "ec_scheduled_events",
      "event_center_held_events": "ec_held_events",
      "event_center_report_template": "ec_report_templates",
      "event_center_site_summary": "ec_site_summary",
      "support_center_call_volume": "sc_call_volume",
      "remote_access_computer_tracking": "sc_computer_tracking",
      "remote_access_computer_usage": "sc_computer_usage",
      "support_center_csr_activity": "sc_csr_activity",
      "support_center_allocation_queue": "sc_allocation_queue",
      "support_center_url_referral": "sc_url_referral",
      "remote_access_csrs_usage": "sc_csrs_usage_report",
      "support_center_support_sessions": "sc_session_query_tool",
      "coupon": "tc_coupon_usage",
      "recording": "tc_recorded_session_access_report",
      "registration": "tc_registration_report",
      "attendee": "tc_training_report_attendee",
      "training_usage": "tc_usage"
    };

    var reverseMapping = function (mapping) {
      var keys = [];
      for (var key in mapping) {
        if (mapping.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      var reversedMap = {};
      for (var i in keys) {
        var k = keys[i];
        var v = mapping[k];
        reversedMap[v] = k;
      }
      return reversedMap;
    };

    this.reverseMapping = reverseMapping;

    var pageid_to_navItemId_mapping_reversed = reverseMapping(pageid_to_navItemId_mapping);
    this.pageid_to_navItemId_mapping_reversed = pageid_to_navItemId_mapping_reversed;

    //TODO: remove
    var getFullURLGivenNavInfoAndPageId = function (navInfo, pageid) {
      var navItemId = pageid_to_navItemId_mapping[pageid];
      if (angular.isUndefined(navItemId)) {
        return undefined;
      }
      var filterByNavItemId = function (navElement) {
        var returnValue = false;
        if (navElement.ns1_navItemId === navItemId) {
          returnValue = true;
        }
        return returnValue;
      };
      var navItems = navInfo.ns1_siteAdminNavUrl.filter(filterByNavItemId);
      var navItem = navItems[0]; //assume one and only one item returned
      if (angular.isUndefined(navItem)) {
        $log.log("YUTR: navItem is undefined");
      }
      return navItem.ns1_url;
    };

    var getNavItemsByCategoryName = function (navInfo, categoryName) {
      var filterByCategoryName = function (navElement) {
        var returnValue = false;
        if (navElement.ns1_category === categoryName) {
          returnValue = true;
        }
        return returnValue;
      };
      var navItems = navInfo.ns1_siteAdminNavUrl.filter(filterByCategoryName);
      return navItems;
    };

    this.getNavItemsByCategoryName = getNavItemsByCategoryName;

    var UIsref = function (theUrl, rid, siteUrl) {
      this.siteUrl = siteUrl;
      this.reportPageId = rid;
      this.reportPageId_translated = $translate.instant("webexSiteReports." +
        rid);
      this.reportPageIframeUrl = theUrl;
      this.modifiedUrl = this.reportPageIframeUrl;
      this.toUIsrefString = function () {
        return "webex-reports.webex-reports-iframe({" +
          "  siteUrl:" + "'" + this.siteUrl + "'" + "," +
          "  reportPageId:" + "'" + this.reportPageId + "'" + "," +
          "  reportPageIframeUrl:" + "'" + this.reportPageIframeUrl + "'" +
          "})";
      };
      this.uisrefString = this.toUIsrefString();
    };

    this.instantiateUIsref = function (theUrl, rid, siteUrl) {
      return new UIsref(theUrl, rid, siteUrl);
    };

    var getUISrefs = function (navItems, siteUrl) {
      var toUisref = function (ni) {
        var navItemId = ni.ns1_navItemId;
        var theUrl = ni.ns1_url;
        var pageId = pageid_to_navItemId_mapping_reversed[navItemId];
        return new UIsref(theUrl, pageId, siteUrl);
      };
      return navItems.map(toUisref);
    };

    this.getUISrefs = getUISrefs;

    var ReportsSection = function (sectionName, siteUrl, reportLinks, categoryName) {
      var self = this;
      this.section_name = sectionName;
      this.site_url = siteUrl;
      this.report_links = reportLinks;
      this.category_Name = categoryName;
      this.section_name_translated = $translate.instant("webexSiteReports." + this.section_name);
      //We have to rewrite this with the actual uirefs with proper reportids
      //right now I've hardcoded as reportID.
      this.uisrefs = self.report_links.map(function (thelink) {
        return new UIsref(thelink, "ReportID", self.site_url);
      });
      this.isEmpty = function () {
        return (angular.isUndefined(self.uisrefs)) || (self.uisrefs.length === 0);
      };
      this.isNotEmpty = function () {
        return !self.isEmpty();
      };
    };

    this.ReportsSection = ReportsSection;

    var Reports = function () {
      this.sections = [];
      this.setSections = function (secs) {
        var nonEmptySections = secs.filter(function (s) {
          return s.isNotEmpty();
        });
        this.sections = nonEmptySections;
      };
      this.getSections = function () {
        return this.sections;
      };
    };
    this.getReports = function (siteUrl, mapJson) {
      //get the reports list, for now hard code.
      var common_reports = new ReportsSection("common_reports", siteUrl, ["/x/y/z", "/u/io/p"],
        "CommonReports");
      var event_center = new ReportsSection("event_center", siteUrl, ["/u/y/z", "www.yahoo.com"],
        "EC");
      var support_center = new ReportsSection("support_center", siteUrl, ["/u/y/z", "www.yahoo.com"],
        "SC");
      var training_center = new ReportsSection("training_center", siteUrl, ["/u/y/z", "www.yahoo.com"],
        "TC");
      var remote_access = new ReportsSection("remote_access", siteUrl, ["/u/y/z", "www.yahoo.com"],
        "RA");

      var uisrefsArray = [];

      var mapJsonDefined = angular.isDefined(mapJson);

      //use the above 5 lists to gather all the UISrefs
      [
        [common_reports_pageids, common_reports],
        [training_center_pageids, training_center],
        [support_center_pageids, support_center],
        [event_center_pageids, event_center],
        [remote_access_pageids, remote_access]
      ].forEach(function (xs) {
        var pageids = xs[0];
        var section = xs[1];
        var category_Name = section.category_Name;
        if (mapJsonDefined) {
          var navItemsFilteredByCategoryName = getNavItemsByCategoryName(mapJson.bodyJson,
            category_Name);
          section.uisrefs = getUISrefs(navItemsFilteredByCategoryName, siteUrl);
        }
        // section.uisrefs = pageids.map(function (rid) {
        //   var theUrl = "www.yahoo.com";
        //   if (mapJsonDefined) {
        //     var tempUrl = getFullURLGivenNavInfoAndPageId(mapJson.bodyJson, rid);
        //     if (angular.isDefined(tempUrl)) {
        //       theUrl = tempUrl;
        //     }
        //   }
        //   return new UIsref(theUrl, rid, siteUrl);
        // });
      });

      var repts = new Reports();
      repts.setSections([common_reports, training_center, support_center,
        event_center, remote_access
      ]);
      return repts;
    };

    this.initReportsObject = function (requestedSiteUrl) {
      var reportsObject = {};
      var funcName = "initReportsObject()";
      var logMsg = funcName;

      var _this = this;
      var displayLabel = null;

      var siteUrl = requestedSiteUrl || '';
      var siteName = WebExUtilsFact.getSiteName(siteUrl);
      logMsg = funcName + ": " + "\n" +
        "siteUrl=" + siteUrl + "; " +
        "siteName=" + siteName;
      $log.log(logMsg);

      reportsObject["siteUrl"] = siteUrl;
      reportsObject["siteName"] = siteName;
      reportsObject["viewReady"] = false;

      WebExXmlApiFact.getSessionTicket(siteUrl).then(
        function getSessionTicketSuccess(sessionTicket) {
          var funcName = "initReportsObject().getSessionTicketSuccess()";
          var logMsg = "";

          reportsObject["sessionTicketError"] = false;

          webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
          webExXmlApiInfoObj.webexSiteName = siteName;
          webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;

          var navInfoDef = self.getNaviationInfo();

          navInfoDef.then(function (result) {
            var resultString = JSON.stringify(result);
            $log.log("Result is ----**** " + resultString);

            var y = WebExUtilsFact.validateAdminPagesInfoXmlData(result.reportPagesInfoXml);

            $log.log("Validated Result is ==== " + JSON.stringify(y.bodyJson));

            reportsObject["mapJson"] = y;

            var rpts = self.getReports(siteUrl, y);
            reportsObject["reports"] = rpts;
            reportsObject["viewReady"] = true;

          });

          // what is purpose of this???
          //_this.getSiteSettingsInfo();
        }, // getSessionTicketSuccess()

        function getSessionTicketError(errId) {
          var funcName = "initReportsObject().getSessionTicketError()";
          var logMsg = "";

          logMsg = funcName + ": " + "errId=" + errId;
          $log.log(logMsg);

          reportsObject["sessionTicketError"] = true;
        } // getSessionTicketError()
      ); // _this.getSessionTicket().then()

      return reportsObject;
    }; //end initReportsObject

    this.getNaviationInfo = function () {
      var reportPagesInfoXml = WebExXmlApiFact.getAdminPagesInfo(
        false,
        webExXmlApiInfoObj
      );

      return $q.all({
        // siteInfoXml: siteInfoXml,
        // meetingTypesInfoXml: meetingTypesInfoXml,
        reportPagesInfoXml: reportPagesInfoXml
      });
    };

  } //end top level service function
]);
