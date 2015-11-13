'use strict';

describe('Global Unit Test Config', function () {
  // NOTE: fixturesPath is a singleton.  Changing this path changes it
  // for all tests!  Please know what you are doing before changing.
  jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures';

  // if (jasmine.version) { //the case for version 2.0.0
  //   //console.log('jasmine-version:' + jasmine.version);
  // } else { //the case for version 1.3
  //   //console.log('jasmine-version:' + jasmine.getEnv().versionString());
  // }
});
