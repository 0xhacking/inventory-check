'use strict';

describe('Service: PstnSetupService', function () {
  var $httpBackend, HuronConfig, PstnSetupService;

  var customerId = '744d58c5-9205-47d6-b7de-a176e3ca431f';
  var partnerId = '4e2befa3-9d82-4fdf-ad31-bb862133f078';
  var carrierId = '4f5f5bf7-0034-4ade-8b1c-db63777f062c';
  var orderId = '29c63c1f-83b0-42b9-98ee-85624e4c7409';

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var customerOrderList = getJSONFixture('huron/json/pstnSetup/customerOrderList.json');
  var customerOrder = getJSONFixture('huron/json/pstnSetup/customerOrder.json');

  var customerPayload = {
    uuid: customerId,
    name: "myCustomer",
    reseller: partnerId,
    billingAddress: {
      "billingName": "Cisco Systems",
      "billingStreetNumber": "2200",
      "billingStreetDirectional": "E",
      "billingStreetName": "President George Bush",
      "billingStreetSuffix": "Hwy",
      "billingAddressSub": "",
      "billingCity": "Richardson",
      "billingState": "TX",
      "billingZip": "75082"
    }
  };

  var blockOrderPayload = {
    "npa": "555",
    "quantity": "20",
    "serviceName": "Cisco Systems",
    "serviceStreetNumber": "2200",
    "serviceStreetDirectional": "E",
    "serviceStreetName": "President George Bush",
    "serviceStreetSuffix": "Hwy",
    "serviceAddressSub": "",
    "serviceCity": "Richardson",
    "serviceState": "TX",
    "serviceZip": "75082"
  };

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _PstnSetupService_) {
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    PstnSetupService = _PstnSetupService_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should create a customer', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers', customerPayload).respond(201);

    PstnSetupService.createCustomer(customerPayload.uuid, customerPayload.name, customerPayload.reseller);
    $httpBackend.flush();
  });

  it('should get a customer', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId).respond(customer);

    PstnSetupService.getCustomer(customerId);
    $httpBackend.flush();
  });

  it('should retrieve a customer\'s carrier', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/pstn/carriers').respond(customerCarrierList);
    var promise = PstnSetupService.getCarrierId(customerId, 'INTELEPEER');
    promise.then(function (value) {
      expect(value).toEqual('4f5f5bf7-0034-4ade-8b1c-db63777f062c');
    });
    $httpBackend.flush();
  });

  it('should reject promise if carrier is not found', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/pstn/carriers').respond([]);
    var promise = PstnSetupService.getCarrierId(customerId, 'INTELEPEER');
    promise.then(function (response) {
      expect(response).toBeUndefined();
    }, function (response) {
      expect(response).toEqual('carrier not found');
    });
    $httpBackend.flush();
  });

  it('should make a block order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/pstn/carriers/' + carrierId + '/did/block', blockOrderPayload).respond(201);
    PstnSetupService.orderBlock(customerId, carrierId, blockOrderPayload.npa, blockOrderPayload.quantity);
    $httpBackend.flush();
  });

  it('should list pending orders', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    var promise = PstnSetupService.listPendingOrders(customerId);
    promise.then(function (orderList) {
      expect(angular.equals(orderList, customerOrderList)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should get a single order', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders/' + orderId).respond(customerOrder);
    var promise = PstnSetupService.getOrder(customerId, orderId);
    promise.then(function (order) {
      expect(angular.equals(order, customerOrder)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should list pending numbers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders/' + orderId).respond(customerOrder);
    var promise = PstnSetupService.listPendingNumbers(customerId, 'INTELEPEER');
    promise.then(function (numbers) {
      expect(numbers).toContain('5125934450');
    });
    $httpBackend.flush();
  });

});
