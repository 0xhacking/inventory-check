  'use strict';

  describe('AddResourceCommonServiceV2', function () {
    beforeEach(angular.mock.module('Mediafusion'));
    var httpBackend, $q, AddResourceCommonServiceV2, MediaClusterServiceV2, MediaServiceActivationV2, authinfo, Notification;
    beforeEach(inject(function (_$q_, _AddResourceCommonServiceV2_, $httpBackend, _MediaClusterServiceV2_, _MediaServiceActivationV2_, _Authinfo_, _Notification_) {
      authinfo = _Authinfo_;
      authinfo.getOrgId = sinon.stub().returns('orgId');
      httpBackend = $httpBackend;
      httpBackend.when('GET', /^\w+.*/).respond({});
      AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
      MediaClusterServiceV2 = _MediaClusterServiceV2_;
      MediaServiceActivationV2 = _MediaServiceActivationV2_;
      Notification = _Notification_;
      $q = _$q_;
    }));
    it('MediaClusterServiceV2 getAll should be called for updateClusterLists', function () {
      var clusters = [{
        "id": "a050fcc7-9ade-4790-a06d-cca596910421",
        "name": "MFA_TEST2",
        "targetType": 'mf_mgmt',
        "connectors": [{
          state: 'running',
          hostname: 'doesnothavecalendar.example.org'
        }]
      }];
      spyOn(MediaClusterServiceV2, 'getAll').and.returnValue($q.when(
        clusters
      ));
      AddResourceCommonServiceV2.updateClusterLists();
      httpBackend.verifyNoOutstandingExpectation();
      expect(MediaClusterServiceV2.getAll).toHaveBeenCalled();
    });
    it('MediaClusterServiceV2 createClusterV2 should be called for addRedirectTargetClicked', function () {
      httpBackend.when('POST', "https://hercules-integration.wbx2.com/v1/organizations/orgId/allowedRedirectTargets").respond({});
      spyOn(MediaClusterServiceV2, 'createClusterV2').and.returnValue($q.when({
        data: {
          id: "12345"
        } }));
      AddResourceCommonServiceV2.addRedirectTargetClicked('hostName', 'enteredCluster');
      httpBackend.flush();
      expect(MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();
    });
    it('should notify error when the createClusterV2 call fails for addRedirectTargetClicked', function () {
      spyOn(Notification, 'errorWithTrackingId');
      httpBackend.when('POST', "https://hercules-integration.wbx2.com/v1/organizations/orgId/allowedRedirectTargets").respond(500, null);
      spyOn(MediaClusterServiceV2, 'createClusterV2').and.returnValue($q.reject());
      AddResourceCommonServiceV2.addRedirectTargetClicked('hostName', 'enteredCluster');
      httpBackend.verifyNoOutstandingExpectation();
      expect(MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    });
    it('MediaServiceActivationV2 enableMediaService should be called for redirectPopUpAndClose', function () {
      spyOn(MediaServiceActivationV2, 'enableMediaService');
      AddResourceCommonServiceV2.redirectPopUpAndClose('hostName', 'enteredCluster', 'clusterId', true);
      expect(MediaServiceActivationV2.enableMediaService).toHaveBeenCalled();

    });
  });
