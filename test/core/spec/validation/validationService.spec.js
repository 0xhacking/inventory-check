'use strict';

describe('Service: ValidationService', function () {
  var ValidationService;

  beforeEach(module('Core'));

  beforeEach(inject(function (_ValidationService_) {
    ValidationService = _ValidationService_;
  }));

  describe('Validate Trial License Count', function () {
    it('should accept 100 as valid', function () {
      expect(ValidationService.trialLicenseCount(100)).toBe(true);
    });

    it('should reject 0 as invalid', function () {
      expect(ValidationService.trialLicenseCount(0)).toBe(false);
    });

    it('should reject -1 as invalid', function () {
      expect(ValidationService.trialLicenseCount(-1)).toBe(false);
    });

    it('should reject 1000 as invalid', function () {
      expect(ValidationService.trialLicenseCount(1000)).toBe(false);
    });
  });

});
