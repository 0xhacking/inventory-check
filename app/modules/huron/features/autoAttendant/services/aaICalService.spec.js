'use strict';

describe('Service: AACalendarService', function () {
  var AAICalService, ical;
  // require('jasmine-collection-matchers');
  var starttime, endtime;
  var defaultRange = {
    days: [{
      abbr: 'SU',
      index: 0,
      active: false
    }, {
      abbr: 'MO',
      index: 1,
      active: false
    }, {
      abbr: 'TU',
      index: 2,
      active: false
    }, {
      abbr: 'WE',
      index: 3,
      active: false
    }, {
      abbr: 'TH',
      index: 4,
      active: false
    }, {
      abbr: 'FR',
      index: 5,
      active: false
    }, {
      abbr: 'SA',
      index: 6,
      active: false
    }]
  };

  var days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  var ranks = [{
    label: 'ranks.first',
    index: 0,
    number: 1
  }, {
    label: 'ranks.second',
    index: 1,
    number: 2
  }, {
    label: 'ranks.third',
    index: 2,
    number: 3
  }, {
    label: 'ranks.fourth',
    index: 3,
    number: 4
  }, {
    label: 'ranks.last',
    index: -1,
    number: -1
  }];

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AAICalService_, _ical_) {
    AAICalService = _AAICalService_;
    ical = _ical_;
    var date = new Date();
    starttime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), '8', 0, 0);
    endtime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), '17', 0, 0);
  }));

  describe('createCalendar', function () {
    it('should return a new calendar object from ical', function () {
      var actual = AAICalService.createCalendar();

      var expected = new ical.Component('vcalendar');
      var tz = 'UTC/GMT';
      var timezoneComp = new ical.Component('vtimezone');
      timezoneComp.addPropertyWithValue('tzid', tz);
      timezoneComp.addPropertyWithValue('x-lic-location', tz);
      expected.addSubcomponent(timezoneComp);

      expect(actual).toBeDefined();
      expect(actual).toEqual(expected);
    });
  });

  describe('getDefaultRange', function () {
    it('should return the default range', function () {
      var range = AAICalService.getDefaultRange();
      expect(range).toBeDefined();
      expect(range).toEqual(defaultRange);
    });
  });

  describe('getTwoLetterDays', function () {
    it('should return the days', function () {
      var actual = AAICalService.getTwoLetterDays();
      expect(actual).toBeDefined();
      expect(actual).toEqual(days);
    });
  });

  describe('getRanks', function () {
    it('should return the ranks', function () {
      var actual = AAICalService.getRanks();
      expect(actual).toBeDefined();
      expect(actual).toEqual(ranks);
    });
  });

  describe('addHoursRange - getHoursRanges', function () {
    it('add valid hours range to the calendar and should get the same range', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;
      range.days[5].active = true;
      range.days[6].active = true;
      range.starttime = new Date(starttime);
      range.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0].days).toEqual(range.days);
      expect(rangeFromCalendar[0].starttime.toString()).toEqual(starttime.toString());
      expect(rangeFromCalendar[0].endtime.toString()).toEqual(endtime.toString());
    });

    it('add valid hours range to the calendar and should get the same range (case today is a closed day)', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;
      range.days[5].active = true;
      range.days[6].active = true;
      //Today is a closed day
      var today = _.find(range.days, function (day) {
        if (starttime.getDay() == day.index) {
          return day;
        }
      });
      today.active = false;
      range.starttime = new Date(starttime);
      range.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0].days).toEqual(range.days);
      expect(rangeFromCalendar[0].starttime.toString()).toEqual(moment(starttime).add(1, 'day').toDate().toString());
      expect(rangeFromCalendar[0].endtime.toString()).toEqual(moment(endtime).add(1, 'day').toDate().toString());
    });

    it('add hours range without days to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.starttime = new Date(starttime);
      range.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range);
      expect(calendar).toEqual(AAICalService.createCalendar());
    });

    it('add hours range without start time to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;

      range.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range);
      expect(calendar).toEqual(AAICalService.createCalendar());
    });

    it('add hours range without end time to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;
      range.starttime = new Date(starttime);

      AAICalService.addHoursRange('open', calendar, range);
      expect(calendar).toEqual(AAICalService.createCalendar());
    });

    it('add multiple valid hours ranges to the calendar and should get the same ranges', function () {
      var calendar = AAICalService.createCalendar();
      var range1 = AAICalService.getDefaultRange();
      range1.days[0].active = true;
      range1.days[1].active = true;
      range1.days[2].active = true;
      range1.days[3].active = true;
      range1.days[4].active = true;
      range1.starttime = new Date(starttime);
      range1.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range1);
      var range2 = AAICalService.getDefaultRange();
      range2.days[5].active = true;
      range2.days[6].active = true;
      range2.starttime = new Date(starttime);
      range2.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range2);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(2);
    });

    it('add an exact date holiday and get back holiday range with all day selected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Christmas',
        date: '2016-12-25',
        allDay: true,
        exactDate: true
      };

      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].date).toEqual(range.date);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toBeUndefined();
    });

    it('add an exact date holiday and get back holiday range with all day unselected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Christmas',
        date: '2016-12-25',
        starttime: starttime,
        endtime: endtime,
        exactDate: true
      };

      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].date).toEqual(range.date);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toBeUndefined();
    });

    it('add an exact date holiday and get back holiday range with yearly recurrence', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Christmas',
        date: '2016-12-25',
        allDay: true,
        exactDate: true,
        recurAnnually: true
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].date).toEqual(range.date);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with all day selected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        month: {
          index: 10,
          number: 11
        },
        day: {
          index: 4,
          abbr: 'TH'
        },
        rank: AAICalService.getRanks()[3],
        allDay: true,
        exactDate: false
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with all day unselected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        month: {
          index: 10,
          number: 11
        },
        day: {
          index: 4,
          abbr: 'TH'
        },
        rank: AAICalService.getRanks()[3],
        starttime: starttime,
        endtime: endtime,
        exactDate: false
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with yearly recurrence', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        month: {
          index: 10,
          number: 11
        },
        day: {
          index: 4,
          abbr: 'TH'
        },
        rank: AAICalService.getRanks()[3],
        allDay: true,
        exactDate: false,
        recurAnnually: true
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with yearly recurrence (last Friday of Jan)', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Last Friday of Jan',
        month: {
          index: 0,
          number: 1
        },
        day: {
          index: 5,
          abbr: 'FR'
        },
        rank: AAICalService.getRanks()[4],
        allDay: true,
        exactDate: false,
        recurAnnually: true
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with yearly recurrence (first Tuesday of Feb)', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'First Friday of Feb',
        month: {
          index: 1,
          number: 2
        },
        day: {
          index: 5,
          abbr: 'FR'
        },
        rank: AAICalService.getRanks()[0],
        allDay: true,
        exactDate: false,
        recurAnnually: true
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add multiple holidays and get them sorted', function () {
      //The holidays are sort chronologically based on today, so this test will fail at some point.
      var calendarRaw = {};
      calendarRaw.scheduleData = 'BEGIN:VCALENDAR \n' + 'BEGIN:VTIMEZONE\n' + 'TZID:UTC/GMT\n' + 'X-LIC-LOCATION:UTC/GMT\n' + 'END:VTIMEZONE\n' + 'BEGIN:VEVENT\n' + 'SUMMARY:holiday\n' + 'RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=1\n' + 'DESCRIPTION:First day of Feb\n' + 'PRIORITY:1\n' + 'DTSTART;TZID=UTC/GMT:20150201T000000\n' + 'DTEND;TZID=UTC/GMT:20150201T235900\n' + 'END:VEVENT\n' + 'BEGIN:VEVENT\n' + 'SUMMARY:holiday\n' + 'RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=10\n' + 'DESCRIPTION:Feb 10th\n' + 'PRIORITY:1\n' + 'DTSTART;TZID=UTC/GMT:20150210T000000\n' + 'DTEND;TZID=UTC/GMT:20150210T235900\n' + 'END:VEVENT\n' + 'BEGIN:VEVENT\n' + 'SUMMARY:holiday\n' + 'RRULE:FREQ=YEARLY;BYMONTH=2;BYDAY=WE;BYSETPOS=2\n' + 'DESCRIPTION:Second Wed of Feb\;2\;2\;WE\n' + 'PRIORITY:1\n' + 'DTSTART;TZID=UTC/GMT:20170208T000000\n' + 'DTEND;TZID=UTC/GMT:20170208T235900\n' + 'END:VEVENT\n' + 'BEGIN:VEVENT\n' + 'SUMMARY:holiday\n' + 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=TH;BYSETPOS=4\n' + 'DESCRIPTION:Thanksgiving\;11\;4\;TH\n' + 'PRIORITY:1\n' + 'DTSTART;TZID=UTC/GMT:20161124T000000\n' + 'DTEND;TZID=UTC/GMT:20161124T235900\n' + 'END:VEVENT\n' + 'BEGIN:VEVENT\n' + 'SUMMARY:holiday\n' + 'DESCRIPTION:Christmas\n' + 'PRIORITY:1\n' + 'DTSTART;TZID=UTC/GMT:20101225T000000\n' + 'DTEND;TZID=UTC/GMT:20101225T235900\n' + 'END:VEVENT\n' + 'BEGIN:VEVENT\n' + 'SUMMARY:holiday\n' + 'DESCRIPTION:Last Tuesday of Jan\;1\;-1\;TU\n' + 'PRIORITY:1\n' + 'DTSTART;TZID=UTC/GMT:20120124T000000\n' + 'DTEND;TZID=UTC/GMT:20120124T235900\n' + 'END:VEVENT\n' + 'END:VCALENDAR';
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(6);
      expect(rangeFromCalendar[0].name).toEqual("Christmas");
      expect(rangeFromCalendar[1].name).toEqual("Last Tuesday of Jan");
      expect(rangeFromCalendar[2].name).toEqual("Thanksgiving");
      expect(rangeFromCalendar[3].name).toEqual("First day of Feb");
      expect(rangeFromCalendar[4].name).toEqual("Second Wed of Feb");
      expect(rangeFromCalendar[5].name).toEqual("Feb 10th");
    });
  });
});
