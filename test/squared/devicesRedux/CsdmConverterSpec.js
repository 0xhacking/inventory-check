'use strict';

describe('CsdmConverterSpec', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var converter;

  beforeEach(inject(function (CsdmConverter) {
    converter = CsdmConverter;
  }));

  it('should format activation code', function () {
    var arr = [{
      activationCode: '1111222233334444'
    }];
    expect(converter.convertDevices(arr)[0].readableActivationCode).toBe('1111 2222 3333 4444');
  });

  it('should add needsActivation flag', function () {
    var arr = [{
      state: 'UNCLAIMED'
    }];
    expect(converter.convertDevices(arr)[0].needsActivation).toBeTruthy();
  });

  it('unknown product should be cleared', function () {
    var arr = [{
      product: 'UNKNOWN'
    }];
    expect(converter.convertDevices(arr)[0].product).toBe('');
  });

  it('should set isOnline when status is CONNECTED', function () {
    var arr = [{
      status: {
        connectionStatus: 'CONNECTED'
      }
    }];
    expect(converter.convertDevices(arr)[0].isOnline).toBeTruthy();
  });

  it('should not set isOnline when status isnt CONNECTED', function () {
    var arr = [{
      status: {
        connectionStatus: 'foo'
      }
    }];
    expect(converter.convertDevices(arr)[0].isOnline).toBeFalsy();
  });

  describe('pass thru fields', function () {

    it('displayName', function () {
      var arr = [{
        displayName: 'bar'
      }];
      expect(converter.convertDevices(arr)[0].displayName).toBe('bar');
    });

    it('mac', function () {
      var arr = [{
        mac: 'bar'
      }];
      expect(converter.convertDevices(arr)[0].mac).toBe('bar');
    });

    it('product', function () {
      var arr = [{
        product: 'bar'
      }];
      expect(converter.convertDevices(arr)[0].product).toBe('bar');
    });

    it('serial', function () {
      var arr = [{
        serial: 'bar'
      }];
      expect(converter.convertDevices(arr)[0].serial).toBe('bar');
    });

    it('url', function () {
      var arr = [{
        url: 'foo'
      }];
      expect(converter.convertDevices(arr)[0].url).toBe('foo');
    });

  }); // pass thru fields

  describe('readableState and cssColorClass', function () {
    it('should convert device with issues red color but keep status', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          level: "error",
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertDevices(arr)[0].readableState).toBe('CsdmStatus.Online');
      expect(converter.convertDevices(arr)[0].cssColorClass).toBe('device-status-red');
    });

    it('should convert state UNCLAIMED to Needs Activation and yellow', function () {
      var arr = [{
        state: 'UNCLAIMED'
      }];
      expect(converter.convertDevices(arr)[0].readableState).toBe('CsdmStatus.NeedsActivation');
      expect(converter.convertDevices(arr)[0].cssColorClass).toBe('device-status-yellow');
    });

    it('should convert state CLAIMED and connection status CONNECTED to Online and green', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertDevices(arr)[0].readableState).toBe('CsdmStatus.Online');
      expect(converter.convertDevices(arr)[0].cssColorClass).toBe('device-status-green');
    });

    it('should convert state CLAIMED and connection status UNKNOWN to Offline and gray', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          connectionStatus: 'UNKNOWN'
        }
      }];
      expect(converter.convertDevices(arr)[0].readableState).toBe('CsdmStatus.Offline');
      expect(converter.convertDevices(arr)[0].cssColorClass).toBe('device-status-gray');
    });

    it('should convert state CLAIMED and no connection status to Offline and gray', function () {
      var arr = [{
        state: 'CLAIMED'
      }];
      expect(converter.convertDevices(arr)[0].readableState).toBe('CsdmStatus.Offline');
      expect(converter.convertDevices(arr)[0].cssColorClass).toBe('device-status-gray');
    });

    it('should convert null state and null connection status to Unknown and yellow', function () {
      var arr = [{}];
      expect(converter.convertDevices(arr)[0].readableState).toBe('CsdmStatus.Unknown');
      expect(converter.convertDevices(arr)[0].cssColorClass).toBe('device-status-yellow');
    });

  }); // aggregatedState & cssColorClass

  describe("software event", function () {
    it('should convert software', function () {
      var arr = [{
        status: {
          events: [{
            type: 'software',
            level: 'INFO',
            description: 'sw_version'
          }]
        }
      }];
      expect(converter.convertDevices(arr)[0].software).toBe('sw_version');
    });

    it('should not fail when no software events', function () {
      var arr = [{
        status: {}
      }];
      expect(converter.convertDevices(arr)[0].software).toBeFalsy();
    });
  });

  describe("ip event", function () {
    it('should convert ip', function () {
      var arr = [{
        status: {
          events: [{
            type: 'ip',
            level: 'INFO',
            description: 'ip_addr'
          }]
        }
      }];
      expect(converter.convertDevices(arr)[0].ip).toBe('ip_addr');
    });
  });

  describe("diagnostics events", function () {
    xit('should show localized tcpfallback', function () {
      var arr = [{
        status: {
          events: [{
            type: 'mediaProtocol',
            level: 'warn',
            description: 'tcpfallback_description',
            references: {
              mediaProtocol: 'TCP'
            }
          }]
        }
      }];
      expect(converter.convertDevices(arr)[0].diagnosticsEvents[0].type).toBe('Potential Loss of Video Quality');
      expect(converter.convertDevices(arr)[0].diagnosticsEvents[0].message).toBe('This device is communicating via the TCP protocol, which could cause higher latency and therefore reduced media streaming experience. If you are experiencing issues with your media streaming, you can try to open UDP port 33434 on your local firewall to aid media streaming issues.');
    });

    it('should show unknown error occured when not in translate file and no description', function () {
      var arr = [{
        status: {
          events: [{
            type: 'foo',
            level: 'warn'
          }]
        }
      }];
      expect(converter.convertDevices(arr)[0].diagnosticsEvents[0].type).toBe('CsdmStatus.errorCodes.unknown.type');
      expect(converter.convertDevices(arr)[0].diagnosticsEvents[0].message).toBe('CsdmStatus.errorCodes.unknown.message');
    });
  });

  describe("has issues", function () {
    it('has issues when status.level is not ok', function () {
      var arr = [{
        status: {
          level: 'not_ok',
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertDevices(arr)[0].hasIssues).toBeTruthy();
    });

    it('has does not have issues when status.level is not ok and device is OFFLINE', function () {
      var arr = [{
        status: {
          level: 'not_ok',
          connectionStatus: 'OFFLINE'
        }
      }];
      expect(converter.convertDevices(arr)[0].hasIssues).toBeFalsy();
    });

    it('has does not have issues when status.level is ok', function () {
      var arr = [{
        status: {
          level: 'OK',
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertDevices(arr)[0].hasIssues).toBeFalsy();
    });
  });
});
