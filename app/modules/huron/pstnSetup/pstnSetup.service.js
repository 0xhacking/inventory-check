(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetupService', PstnSetupService);

  /* @ngInject */
  function PstnSetupService($q, $translate, Authinfo, Notification, PstnSetup, TerminusCarrierService,
    TerminusCustomerService, TerminusCustomerV2Service, TerminusCustomerTrialV2Service,
    TerminusCustomerCarrierService, TerminusOrderV2Service,
    TerminusCarrierInventoryCount, TerminusNumberService, TerminusCarrierInventorySearch,
    TerminusCarrierInventoryReserve, TerminusCarrierInventoryRelease,
    TerminusCustomerCarrierInventoryReserve, TerminusCustomerCarrierInventoryRelease,
    TerminusCustomerCarrierDidService, TerminusCustomerPortService, TerminusResellerCarrierService,
    TerminusV2CarrierNumberCountService, TerminusV2CarrierNumberService,
    TerminusV2ResellerNumberReservationService, TerminusV2ResellerCarrierNumberReservationService,
    TerminusV2CustomerNumberReservationService,
    TerminusV2CustomerNumberOrderBlockService, TelephoneNumberService) {
    //Providers
    var INTELEPEER = "INTELEPEER";
    var TATA = "TATA";
    var TELSTRA = "TELSTRA";
    var WESTUC = 'WESTUC';
    //e911 order operations
    var UPDATE = 'UPDATE';
    var DELETE = 'DELETE';
    var ADD = 'ADD';
    //did order status
    var PENDING = 'PENDING';
    var PROVISIONED = 'PROVISIONED';
    var QUEUED = "QUEUED";
    //did order types
    var NUMBER_ORDER = 'NUMBER_ORDER';
    var PORT_ORDER = 'PORT_ORDER';
    var BLOCK_ORDER = 'BLOCK_ORDER';
    //$resource constants
    var BLOCK = 'block';
    var ORDER = 'order';
    var PORT = 'port';
    var NUMTYPE_DID = 'did';
    var NUMTYPE_TOLLFREE = 'tollfree';
    //misc
    var PSTN = "PSTN";
    var TYPE_PORT = "PORT";
    var GROUP_BY = "groupBy";
    var NPA = 'npa';
    var NXX = 'nxx';

    var service = {
      createCustomer: createCustomer,
      createCustomerV2: createCustomerV2,
      updateCustomerCarrier: updateCustomerCarrier,
      getCustomer: getCustomer,
      getCustomerV2: getCustomerV2,
      getCustomerTrialV2: getCustomerTrialV2,
      setCustomerTrialV2: setCustomerTrialV2,
      listDefaultCarriers: listDefaultCarriers,
      getCarrierInventory: getCarrierInventory,
      getCarrierTollFreeInventory: getCarrierTollFreeInventory,
      searchCarrierInventory: searchCarrierInventory,
      searchCarrierTollFreeInventory: searchCarrierTollFreeInventory,
      reserveCarrierInventory: reserveCarrierInventory,
      releaseCarrierInventory: releaseCarrierInventory,
      releaseCarrierTollFreeInventory: releaseCarrierTollFreeInventory,
      reserveCarrierTollFreeInventory: reserveCarrierTollFreeInventory,
      isCarrierSwivel: isCarrierSwivel,
      listCustomerCarriers: listCustomerCarriers,
      listResellerCarriers: listResellerCarriers,
      orderBlock: orderBlock,
      orderTollFreeBlock: orderTollFreeBlock,
      orderNumbers: orderNumbers,
      orderNumbersV2: orderNumbersV2,
      portNumbers: portNumbers,
      listPendingOrders: listPendingOrders,
      getOrder: getOrder,
      getFormattedNumberOrders: getFormattedNumberOrders,
      translateStatusMessage: translateStatusMessage,
      listPendingNumbers: listPendingNumbers,
      deleteNumber: deleteNumber,
      INTELEPEER: INTELEPEER,
      TATA: TATA,
      TELSTRA: TELSTRA,
      WESTUC: WESTUC,
      PSTN: PSTN,
      PENDING: PENDING,
      QUEUED: QUEUED,
      BLOCK: BLOCK,
      ORDER: ORDER,
      PORT_ORDER: PORT_ORDER,
      BLOCK_ORDER: BLOCK_ORDER,
      NUMBER_ORDER: NUMBER_ORDER,
      NUMTYPE_DID: NUMTYPE_DID,
      NUMTYPE_TOLLFREE: NUMTYPE_TOLLFREE
    };

    return service;

    function createCustomer(uuid, name, firstName, lastName, email, pstnCarrierId, numbers, trial) {
      var payload = {
        uuid: uuid,
        name: name,
        firstName: firstName,
        lastName: lastName,
        email: email,
        pstnCarrierId: pstnCarrierId,
        numbers: numbers,
        trial: trial
      };

      if (PstnSetup.isResellerExists()) {
        payload.resellerId = Authinfo.getOrgId();
      }
      return TerminusCustomerService.save({}, payload).$promise;
    }

    function createCustomerV2(uuid, name, firstName, lastName, email, pstnCarrierId, trial) {
      var payload = {
        uuid: uuid,
        name: name,
        firstName: firstName,
        lastName: lastName,
        email: email,
        pstnCarrierId: pstnCarrierId,
        trial: trial
      };

      if (PstnSetup.isResellerExists()) {
        payload.resellerId = Authinfo.getOrgId();
      }
      return TerminusCustomerV2Service.save({}, payload).$promise;
    }

    function updateCustomerCarrier(customerId, pstnCarrierId) {
      var payload = {
        pstnCarrierId: pstnCarrierId
      };
      return TerminusCustomerService.update({
        customerId: customerId
      }, payload).$promise;
    }

    function getCustomer(customerId) {
      return TerminusCustomerService.get({
        customerId: customerId
      }).$promise;
    }

    function getCustomerV2(customerId) {
      return TerminusCustomerV2Service.get({
        customerId: customerId
      }).$promise;
    }

    function getCustomerTrialV2(customerId) {
      return TerminusCustomerTrialV2Service.get({
        customerId: customerId
      }).$promise;
    }

    function setCustomerTrialV2(customerId, fname, lname, email) {
      return TerminusCustomerTrialV2Service.save({
        customerId: customerId
      }, {
        "acceptedFirstName": fname,
        "acceptedLastName": lname,
        "acceptedEmail": email
      }).$promise;
    }

    function listDefaultCarriers() {
      return TerminusCarrierService.query({
        service: PSTN,
        defaultOffer: true
      }).$promise.then(getCarrierDetails);
    }

    function listResellerCarriers() {
      return TerminusResellerCarrierService.query({
        resellerId: Authinfo.getOrgId()
      }).$promise.then(getCarrierDetails);
    }

    function listCustomerCarriers(customerId) {
      return TerminusCustomerCarrierService.query({
        customerId: customerId
      }).$promise.then(getCarrierDetails);
    }

    function getCarrierDetails(carriers) {
      var promises = [];
      _.forEach(carriers, function (carrier) {
        var promise = TerminusCarrierService.get({
          carrierId: carrier.uuid
        }).$promise;
        promises.push(promise);
      });
      return $q.all(promises);
    }

    function getCarrierInventory(carrierId, state, npa) {
      var config = {
        carrierId: carrierId,
        state: state
      };
      if (_.isString(npa)) {
        if (npa.length > 0) {
          config[NPA] = npa;
          config[GROUP_BY] = NXX;
        }
      }
      return TerminusCarrierInventoryCount.get(config).$promise;
    }

    function getCarrierTollFreeInventory(carrierId) {
      return TerminusV2CarrierNumberCountService.get({
        carrierId: carrierId,
        numberType: NUMTYPE_TOLLFREE
      }).$promise;
    }

    function searchCarrierInventory(carrierId, params) {
      var paramObj = params || {};
      paramObj.carrierId = carrierId;
      return TerminusCarrierInventorySearch.get(paramObj).$promise
        .then(function (response) {
          return _.get(response, 'numbers', []);
        });
    }

    function searchCarrierTollFreeInventory(carrierId, params) {
      var paramObj = params || {};
      paramObj.carrierId = carrierId;
      paramObj.numberType = NUMTYPE_TOLLFREE;
      return TerminusV2CarrierNumberService.get(paramObj).$promise
        .then(function (response) {
          return _.get(response, 'numbers', []);
        });
    }

    function reserveCarrierInventory(customerId, carrierId, numbers, isCustomerExists) {
      if (!_.isArray(numbers)) {
        numbers = [numbers];
      }

      if (isCustomerExists) {
        // If a customer exists, reserve with the customer
        return TerminusCustomerCarrierInventoryReserve.save({
          customerId: customerId,
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      } else {
        // Otherwise reserve with carrier
        return TerminusCarrierInventoryReserve.save({
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      }
    }

    function releaseCarrierInventory(customerId, carrierId, numbers, isCustomerExists) {
      if (!_.isArray(numbers)) {
        numbers = [numbers];
      }
      if (isCustomerExists) {
        // If a customer exists, release with the customer
        return TerminusCustomerCarrierInventoryRelease.save({
          customerId: customerId,
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      } else {
        // Otherwise release with carrier
        return TerminusCarrierInventoryRelease.save({
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      }
    }

    function releaseCarrierTollFreeInventory(customerId, carrierId, numbers, reservationId, isCustomerExists) {
      if (!_.isArray(numbers)) {
        numbers = [numbers];
      }
      if (isCustomerExists) {
        // If a customer exists, release with the customer
        return TerminusV2CustomerNumberReservationService.delete({
          customerId: customerId,
          reservationId: reservationId
        }, {
          numbers: numbers
        }).$promise;
      } else {
        // Otherwise release with carrier
        return TerminusV2ResellerNumberReservationService.delete({
          resellerId: Authinfo.getOrgId(),
          reservationId: reservationId
        }, {
          numbers: numbers
        }).$promise;
      }
    }

    function reserveCarrierTollFreeInventory(customerId, carrierId, numbers, isCustomerExists) {
      if (!_.isArray(numbers)) {
        numbers = [numbers];
      }

      if (isCustomerExists) {
        // If a customer exists, reserve with the customer
        return TerminusV2CustomerNumberReservationService.save({
          customerId: customerId
        }, {
          numberType: NUMTYPE_TOLLFREE,
          numbers: numbers
        }, function (data, headers) {
          data.uuid = headers('location').split("/").pop();
          return data;
        }).$promise;
      } else {
        // Otherwise reserve with carrier
        return TerminusV2ResellerCarrierNumberReservationService.save({
          resellerId: Authinfo.getOrgId(),
          carrierId: carrierId
        }, {
          numberType: NUMTYPE_TOLLFREE,
          numbers: numbers
        }, function (data, headers) {
          data.uuid = headers('location').split("/").pop();
          return data;
        }).$promise;
      }
    }

    function isCarrierSwivel(customerId) {
      return listCustomerCarriers(customerId).then(function (carriers) {
        if (_.isArray(carriers)) {
          var carrier = _.find(carriers, {
            name: TATA
          });
          if (carrier) {
            return true;
          }
        }
        return false;
      });
    }

    function orderBlock(customerId, carrierId, npa, quantity, isSequential, nxx) {
      var payload = {
        npa: npa,
        quantity: quantity,
        sequential: isSequential
      };
      if (_.isString(nxx)) {
        payload['nxx'] = nxx;
      }

      return TerminusCustomerCarrierDidService.save({
        customerId: customerId,
        carrierId: carrierId,
        type: BLOCK
      }, payload).$promise;
    }

    function orderTollFreeBlock(customerId, carrierId, npa, quantity) {
      var payload = {
        npa: npa,
        quantity: quantity,
        numberType: NUMTYPE_TOLLFREE
      };
      return TerminusV2CustomerNumberOrderBlockService.save({
        customerId: customerId
      }, payload).$promise;
    }

    function orderNumbers(customerId, carrierId, numbers) {
      var promises = [];
      var payload = {
        pstn: {
          numbers: []
        },
        tollFree: {
          numberType: NUMTYPE_TOLLFREE,
          numbers: []
        }
      };
      _.forEach(numbers, function (number) {
        var phoneNumberType = TelephoneNumberService.getPhoneNumberType(number);
        if (phoneNumberType === 'FIXED_LINE_OR_MOBILE' || phoneNumberType === 'FIXED_LINE') {
          payload.pstn.numbers.push(number);
        } else if (phoneNumberType === 'TOLL_FREE') {
          payload.tollFree.numbers.push(number);
        } else {
          Notification.error('pstnSetup.errors.unsupportedNumberType', {
            type: phoneNumberType,
            number: number
          });
        }
      });
      if (payload.pstn.numbers.length > 0) {
        var pstnPromise = TerminusCustomerCarrierDidService.save({
          customerId: customerId,
          carrierId: carrierId,
          type: ORDER
        }, payload.pstn).$promise;
        promises.push(pstnPromise);
      }
      return $q.all(promises);
    }

    function orderNumbersV2(customerId, newNumberOrders) {
      var promises = [];
      _.forEach(newNumberOrders, function (order) {
        if (order.numberType === NUMTYPE_DID) {
          var didOrderPromise = TerminusOrderV2Service.save({
            customerId: customerId
          }, {
            reservationIds: [_.get(order, 'reservationId', '')],
            numberType: order.numberType
          }).$promise;
          promises.push(didOrderPromise);
        } else if (order.numberType === NUMTYPE_TOLLFREE) {
          var tollFreeOrderPromise = TerminusOrderV2Service.save({
            customerId: customerId
          }, {
            reservationIds: [_.get(order, 'reservationId', '')],
            numberType: order.numberType
          }).$promise;
          promises.push(tollFreeOrderPromise);
        } else {
          Notification.error('pstnSetup.errors.unsupportedOrderType', order.numberType);
        }
      });
      return $q.all(promises);
    }

    function portNumbers(customerId, carrierId, numbers) {
      var promises = [];
      var tfnNumbers = [];

      tfnNumbers = _.remove(numbers, function (number) {
        return TelephoneNumberService.checkPhoneNumberType(number) === 'TOLL_FREE';
      });

      var tfnPayload = {
        numbers: tfnNumbers,
        numberType: NUMTYPE_TOLLFREE
      };

      var payload = {
        numbers: numbers
      };

      if (numbers.length > 0) {
        promises.push(TerminusCustomerCarrierDidService.save({
          customerId: customerId,
          carrierId: carrierId,
          type: PORT
        }, payload).$promise);
      }
      if (tfnNumbers.length > 0) {
        promises.push(TerminusCustomerPortService.save({
          customerId: customerId
        }, tfnPayload).$promise);
      }

      return $q.all(promises);
    }

    function listPendingOrders(customerId) {
      var pendingOrders = [];
      pendingOrders.push(
        TerminusOrderV2Service.get({
          customerId: customerId,
          type: PSTN,
          status: PENDING
        }).$promise
      );
      pendingOrders.push(
        TerminusOrderV2Service.get({
          customerId: customerId,
          type: TYPE_PORT,
          status: PENDING
        }).$promise
      );
      return $q.all(pendingOrders)
        .then(_.flatten);
    }

    function getOrder(customerId, orderId) {
      return TerminusOrderV2Service.query({
        customerId: customerId,
        orderId: orderId
      }).$promise;
    }

    function getFormattedNumberOrders(customerId) {
      return TerminusOrderV2Service.get({
        customerId: customerId
      }).$promise.then(function (orders) {
        var promises = [];
        // Lookup each order and add the numbers to original response
        _.forEach(orders, function (order) {
          if (order.operation != UPDATE && order.operation != DELETE && order.operation != ADD) {
            var promise = getOrder(customerId, order.uuid).then(function (orderResponse) {
              order.numbers = orderResponse.numbers;
              if (!_.isUndefined(orderResponse.attributes.npa)) {
                order.attributes = orderResponse.attributes;
              }
              return order;
            });
            promises.push(promise);
          }
        });
        return $q.all(promises);
      })
      .then(function (response) {
        return _.chain(response)
          .map(function (order) {
            if (order.operation != UPDATE && order.operation != DELETE && order.operation != ADD) {
              var newOrder = {
                carrierOrderId: _.get(order, 'carrierOrderId'),
                //not all orders have batches
                carrierBatchId: _.get(order, 'carrierBatchId', null),
                operation: _.get(order, 'operation'),
                statusMessage: _.get(order, 'statusMessage') === 'None' ? null : _.get(order, 'statusMessage'),
                tooltip: translateStatusMessage(order),
                uuid: _.get(order, 'uuid'),
                numbers: _.get(order, 'numbers')
              };

              //translate order status
              if (order.status === PROVISIONED) {
                newOrder.status = $translate.instant('pstnOrderOverview.successful');
              } else if (order.status === PENDING) {
                newOrder.status = $translate.instant('pstnOrderOverview.inProgress');
              } else if (order.status === QUEUED) {
                newOrder.status = $translate.instant('pstnOrderOverview.inProgress');
              }

              //translate order type
              if (order.operation === BLOCK_ORDER && _.get(order, 'numberType', NUMTYPE_DID) === NUMTYPE_DID) {
                newOrder.type = $translate.instant('pstnOrderOverview.advanceOrder');
              } else if (order.operation === NUMBER_ORDER && _.get(order, 'numberType', NUMTYPE_DID) === NUMTYPE_DID) {
                newOrder.type = $translate.instant('pstnOrderOverview.newNumberOrder');
              } else if (order.operation === BLOCK_ORDER && _.get(order, 'numberType') === NUMTYPE_TOLLFREE) {
                newOrder.type = $translate.instant('pstnOrderOverview.advanceOrder');
              } else if (order.operation === NUMBER_ORDER && _.get(order, 'numberType') === NUMTYPE_TOLLFREE) {
                newOrder.type = $translate.instant('pstnOrderOverview.newNumberOrder');
              } else if (order.operation === PORT_ORDER) {
                newOrder.type = $translate.instant('pstnOrderOverview.portNumberOrder');
              } else if (order.operation == BLOCK_ORDER && order.numberType == NUMTYPE_TOLLFREE) {
                newOrder.type = $translate.instant('pstnOrderOverview.tollFreeNumberAdvanceOrder');
              }

              if (order.operation === BLOCK_ORDER) {
                if (!_.isUndefined(order.attributes)) {
                  newOrder.areaCode = order.attributes.npa;
                  newOrder.quantity = order.attributes.quantity;
                } else {
                  newOrder.areaCode = getAreaCode(order);
                  newOrder.quantity = order.numbers.length;
                }
              }

              //create sort date and translate creation date
              var orderDate = new Date(order.created);
              newOrder.sortDate = orderDate.getTime();
              newOrder.created = (orderDate.getMonth() + 1) + '/' + orderDate.getDate() + '/' + orderDate.getFullYear();
              //update order status and tooltip at number level since we combine same order with different batches
              _.forEach(newOrder.numbers, function (number) {
                number.status = newOrder.status;
                number.tooltip = newOrder.tooltip;
              });
              return newOrder;
            }
            return undefined;
          })
          .compact()
          .value();
      });
    }

    function translateStatusMessage(order) {
      var translations = {
        'Account Number and PIN Required': $translate.instant('pstnSetup.orderStatus.pinRequired'),
        'Address Mismatch': $translate.instant('pstnSetup.orderStatus.addressMismatch'),
        'BTN Mismatch': $translate.instant('pstnSetup.orderStatus.btnMismatch'),
        'Customer has Trial Status': $translate.instant('pstnSetup.orderStatus.trialStatus'),
        'FOC Received': $translate.instant('pstnSetup.orderStatus.focReceived'),
        'Invalid Authorization Signature': $translate.instant('pstnSetup.orderStatus.invalidSig'),
        'LOA Not Signed': $translate.instant('pstnSetup.orderStatus.loaNotSigned'),
        'Master Service Agreement not signed': $translate.instant('pstnSetup.orderStatus.msaNotSigned'),
        'Pending FOC from Vendor': $translate.instant('pstnSetup.orderStatus.pendingVendor'),
        'Rejected': $translate.instant('pstnSetup.orderStatus.rejected')
      };

      if (!_.isUndefined(translations[order.statusMessage])) {
        return translations[order.statusMessage];
      } else if (order.statusMessage !== 'None') {
        return order.statusMessage;
      } else {
        return;
      }
    }

    function listPendingNumbers(customerId) {
      var pendingNumbers = [];

      return listPendingOrders(customerId).then(function (orders) {
        var promises = [];
        _.forEach(orders, function (carrierOrder) {
          if (_.get(carrierOrder, 'operation') === BLOCK_ORDER) {
            var promise = getOrder(customerId, carrierOrder.uuid).then(function (response) {
              if (!_.isUndefined(response.attributes.npa)) {
                var areaCode = response.attributes.npa;
                var orderQuantity = _.parseInt(response.attributes.quantity);
              } else {
                areaCode = getAreaCode(response);
                orderQuantity = response.numbers.length;
              }
              pendingNumbers.push({
                pattern: '(' + areaCode + ') XXX-XXXX',
                quantity: orderQuantity
              });
            });
            promises.push(promise);
          } else {
            promise = getOrder(customerId, carrierOrder.uuid).then(function (response) {
              var orderNumbers = response.numbers;
              _.forEach(orderNumbers, function (orderNumber) {
                if (orderNumber && orderNumber.number && (orderNumber.network === PENDING || orderNumber.network === QUEUED)) {
                  pendingNumbers.push({
                    pattern: _.get(orderNumber, 'number', $translate.instant('pstnSetup.errors.orders.missingNumber', {
                      orderNumber: _.get(response, 'carrierOrderId')
                    }))
                  });
                }
              });
            });
            promises.push(promise);
          }
        });

        return $q.all(promises).then(function () {
          return pendingNumbers;
        });
      });
    }

    function deleteNumber(customerId, number) {
      return TerminusNumberService.delete({
        customerId: customerId,
        did: number
      }).$promise;
    }

    function getAreaCode(order) {
      return _.chain(order)
        .get('description')
        .slice(-3)
        .join('')
        .value();
    }

  }
})();
