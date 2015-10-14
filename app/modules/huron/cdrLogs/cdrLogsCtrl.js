(function () {
  'use strict';

  angular
    .module('uc.cdrlogsupport')
    .controller('CdrLogsCtrl', CdrLogsCtrl);

  /* @ngInject */
  function CdrLogsCtrl($scope, $state, $translate, $timeout, Config, formlyValidationMessages, formlyConfig, CdrService, Notification) {
    var vm = this;
    var SEARCH = "SEARCH";
    var UPLOAD = "UPLOAD";
    var timeFormat = 'hh:mm:ss A';
    var dateFormat = 'YYYY-MM-DD';
    var filetype = "text/json, application/json";
    var errorStatus = [16, 19, 393216, 0, 17, 1, 21];

    vm.gridData = [];
    vm.selectedCDR = null;
    vm.model = {
      'searchUpload': SEARCH,
      'startTime': moment().format(timeFormat),
      'endTime': moment().format(timeFormat),
      'startDate': moment().subtract(1, 'days').format(dateFormat),
      'endDate': moment().format(dateFormat),
      'hitSize': 50
    };

    formlyValidationMessages.addStringMessage('required', $translate.instant('cdrLogs.required'));
    formlyConfig.setType({
      name: 'custom-file',
      templateUrl: 'modules/huron/cdrLogs/formly-field-custom-file.tpl.html',
      wrapper: ['ciscoWrapper']
    });

    var validations = {
      callingNumber: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        if (!angular.isUndefined(scope.fields[3].formControl)) {
          scope.model.callingPartyNumber = value;
          scope.fields[3].formControl.$validate();
        }
        return /^(\+1)?([0-9]+)$/.test(value) || (value === undefined) || (value === "");
      },
      calledNumber: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        return (/^(\+1)?([0-9]+)$/.test(value) && (value !== scope.model.callingPartyNumber)) || (value === undefined) || (value === "");
      },
      callingDevice: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        if (!angular.isUndefined(scope.fields[5].formControl)) {
          scope.model.callingPartyDevice = value;
          scope.fields[5].formControl.$validate();
        }
        return true;
      },
      calledDevice: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        return (value !== scope.model.callingPartyDevice) || (value === undefined) || (value === "");
      },
      startTime: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        if (!angular.isUndefined(scope.fields[7].formControl)) {
          scope.model.startTime = value;
          scope.fields[7].formControl.$validate();
        }
        return /([0-2][0-9][:])([0-5][0-9][:])([0-5][0-9])([ ][apAP][mM])?/.test(value);
      },
      endTime: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        var timeOne = CdrService.formDate(scope.model.startDate, scope.model.startTime);
        var timeTwo = CdrService.formDate(scope.model.endDate, value);
        return /([0-2][0-9][:])([0-5][0-9][:])([0-5][0-9])([ ][apAP][mM])?/.test(value) && (timeTwo > timeOne);
      },
      startDate: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        scope.model.startDate = value;
        if (!angular.isUndefined(scope.fields[7].formControl)) {
          scope.fields[7].formControl.$validate();
        }
        if (!angular.isUndefined(scope.fields[9].formControl)) {
          scope.fields[9].formControl.$validate();
        }
        vm.searchAndUploadForm.$setDirty();
        return true;
      },
      endDate: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        scope.model.endDate = value;
        if (!angular.isUndefined(scope.fields[7].formControl)) {
          scope.fields[7].formControl.$validate();
        }
        vm.searchAndUploadForm.$setDirty();
        scope.showError = moment(value).format() < moment(scope.model.startDate).format();
        return moment(value).format() >= moment(scope.model.startDate).format();
      },
      hitSize: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        return /([1-5]?[0-9])/.test(value) && (0 < value) && (value < 51);
      }
    };

    var messages = {
      blank: function () {
        return "";
      },
      callingNumber: function () {
        return $translate.instant('cdrLogs.phoneNumberError');
      },
      calledNumber: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        if (value === scope.model.callingPartyNumber) {
          return $translate.instant('cdrLogs.phoneNumberErrorTwo');
        } else {
          return $translate.instant('cdrLogs.phoneNumberError');
        }
      },
      calledDevice: function () {
        return $translate.instant('cdrLogs.deviceNameError');
      },
      startTime: function () {
        return $translate.instant('cdrLogs.invalidTime');
      },
      endTime: function (viewValue, modelValue, scope) {
        var value = viewValue || modelValue;
        var timeOne = CdrService.formDate(scope.model.startDate, scope.model.startTime);
        var timeTwo = CdrService.formDate(scope.model.endDate, value);
        if (timeTwo <= timeOne) {
          return $translate.instant('cdrLogs.invalidTimeTwo');
        } else {
          return $translate.instant('cdrLogs.invalidTime');
        }
      },
      endDate: function () {
        return $translate.instant('cdrLogs.invalidDate');
      },
      hitSize: function () {
        return $translate.instant('cdrLogs.hitSizeError');
      }
    };

    var expression = {
      hideSearch: function (viewValue, modelValue, scope) {
        return scope.model.searchUpload !== SEARCH;
      },
      hideUpload: function (viewValue, modelValue, scope) {
        return scope.model.searchUpload !== UPLOAD;
      },
      searchDisabled: function (viewValue, modelValue, scope) {
        return vm.searchAndUploadForm.$invalid || vm.searchAndUploadForm.$pristine;
      },
      uploadDisabled: function (viewValue, modelValue, scope) {
        return angular.isUndefined(scope.model.uploadFile);
      }
    };

    vm.fields = [{
      fieldGroup: [{
        key: 'searchRadio',
        type: 'radio',
        className: 'search-display form-radio',
        templateOptions: {
          label: $translate.instant('cdrLogs.searchForm'),
          value: SEARCH,
          model: 'searchUpload'
        }
      }, {
        key: 'uploadRadio',
        type: 'radio',
        className: 'upload-radio form-radio search-display',
        templateOptions: {
          label: $translate.instant('cdrLogs.uploadFile'),
          value: UPLOAD,
          model: 'searchUpload'
        }
      }, {
        key: 'callingPartyNumber',
        type: 'input',
        className: 'search-display search-indent',
        validators: {
          phoneNumber: {
            expression: validations.callingNumber,
            message: messages.callingNumber
          }
        },
        templateOptions: {
          label: $translate.instant('cdrLogs.number'),
          type: 'text',
          maxlength: 10,
          placeholder: $translate.instant('cdrLogs.callingParty')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'calledPartyNumber',
        type: 'input',
        className: 'search-display',
        validators: {
          phoneNumber: {
            expression: validations.calledNumber,
            message: messages.calledNumber
          }
        },
        templateOptions: {
          type: 'text',
          maxlength: 10,
          placeholder: $translate.instant('cdrLogs.calledParty')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'callingPartyDevice',
        type: 'input',
        className: 'search-display search-indent',
        validators: {
          deviceName: {
            expression: validations.callingDevice,
            message: messages.blank
          }
        },
        templateOptions: {
          label: $translate.instant('cdrLogs.device'),
          type: 'text',
          placeholder: $translate.instant('cdrLogs.callingParty')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'calledPartyDevice',
        type: 'input',
        className: 'search-display',
        validators: {
          deviceName: {
            expression: validations.calledDevice,
            message: messages.calledDevice
          }
        },
        templateOptions: {
          type: 'text',
          placeholder: $translate.instant('cdrLogs.calledParty')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'startTime',
        type: 'input',
        className: 'search-display search-indent',
        validators: {
          time: {
            expression: validations.startTime,
            message: messages.startTime
          }
        },
        templateOptions: {
          label: $translate.instant('cdrLogs.startTime'),
          required: true,
          type: 'text',
          placeholder: $translate.instant('cdrLogs.timeExample')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'endTime',
        type: 'input',
        className: 'search-display',
        validators: {
          time: {
            expression: validations.endTime,
            message: messages.endTime
          }
        },
        templateOptions: {
          label: $translate.instant('cdrLogs.endTime'),
          required: true,
          type: 'text',
          placeholder: $translate.instant('cdrLogs.timeExample')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'startDate',
        type: 'datepicker',
        className: 'search-display search-indent',
        validators: {
          time: {
            expression: validations.startDate,
            message: messages.blank
          }
        },
        templateOptions: {
          inputClass: 'cdr-datepicker',
          label: $translate.instant('cdrLogs.startDate'),
          required: true,
          placeholder: $translate.instant('cdrLogs.dateExample')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'endDate',
        type: 'datepicker',
        className: 'search-display',
        validators: {
          time: {
            expression: validations.endDate,
            message: messages.endDate
          }
        },
        templateOptions: {
          inputClass: 'cdr-datepicker',
          label: $translate.instant('cdrLogs.endDate'),
          required: true,
          placeholder: $translate.instant('cdrLogs.dateExample')
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'hitSize',
        type: 'input',
        className: 'hitsize search-indent',
        validators: {
          hitSize: {
            expression: validations.hitSize,
            message: messages.hitSize
          }
        },
        templateOptions: {
          label: $translate.instant('cdrLogs.size'),
          required: true,
          type: 'number'
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'submit',
        type: 'button',
        className: 'form-button',
        templateOptions: {
          btnClass: 'btn btn-primary search-button',
          label: $translate.instant('cdrLogs.search'),
          onClick: function (options, scope) {
            vm.gridData = null;
            CdrService.query(scope.model).then(function (response) {
              vm.selectedCDR = null;
              vm.gridData = response;
              setupScrolling(vm.gridData);
            });
          }
        },
        expressionProperties: {
          'hide': expression.hideSearch,
          'templateOptions.disabled': expression.searchDisabled
        }
      }, {
        key: 'reset',
        type: 'button',
        className: 'form-button',
        templateOptions: {
          btnClass: 'btn btn-primary search-button',
          label: $translate.instant('cdrLogs.reset'),
          onClick: function (options, scope) {
            vm.model = {
              'searchUpload': SEARCH,
              'startTime': moment().format(timeFormat),
              'endTime': moment().format(timeFormat),
              'startDate': moment().subtract(1, 'days').format(dateFormat),
              'endDate': moment().format(dateFormat),
              'hitSize': 50
            };
            vm.searchAndUploadForm.$setPristine();
          }
        },
        expressionProperties: {
          'hide': expression.hideSearch
        }
      }, {
        key: 'uploadFile',
        type: 'custom-file',
        className: 'upload-display',
        templateOptions: {
          label: $translate.instant('cdrLogs.uploadDescription'),
          filename: 'filename',
          maxSize: 10,
          maxSizeError: function () {
            $scope.$apply(function () {
              Notification.notify($translate.instant('cdrLogs.jsonSizeError'), 'error');
            });
          },
          fileType: filetype,
          fileTypeError: function () {
            $scope.$apply(function () {
              Notification.notify($translate.instant('cdrLogs.jsonTypeError'), 'error');
            });
          },
          fileSuffix: "json"
        },
        expressionProperties: {
          'hide': expression.hideUpload
        }
      }, {
        key: 'uploadBtn',
        type: 'button',
        className: 'form-button',
        templateOptions: {
          btnClass: 'btn btn-primary search-button',
          label: $translate.instant('cdrLogs.upload'),
          onClick: function (options, scope) {
            try {
              var jsonData = JSON.parse(scope.model.uploadFile);
              vm.gridData = [];
              vm.gridData.push(jsonData.cdrs);
            } catch (SyntaxError) {
              Notification.notify($translate.instant('cdrLogs.jsonSyntaxError'), 'error');
            }
          }
        },
        expressionProperties: {
          'hide': expression.hideUpload,
          'templateOptions.disabled': expression.uploadDisabled
        }
      }]
    }];

    vm.statusAvalibility = statusAvalibility;
    vm.getAccordionHeader = getAccordionHeader;
    vm.selectCDR = selectCDR;

    function statusAvalibility(cdrArray) {
      // returns danger if both the calling and called cause codes for each cdr in the array is in the errorStatus array
      for (var callSeg = 0; callSeg < cdrArray.length; callSeg++) {
        for (var i = 0; i < cdrArray[callSeg].length; ++i) {
          if ((errorStatus.indexOf(cdrArray[callSeg][i].dataParam.calling_cause_Value) > -1) && (errorStatus.indexOf(cdrArray[callSeg][i].dataParam.called_cause_Value) > -1)) {
            return 'danger';
          }
        }
      }
      return 'primary';
    }

    function getAccordionHeader(cdrArray) {
      var firstTimestamp = cdrArray[0][0]['@timestamp'];
      var numberOfCdrs = 0;
      var totalDuration = 0;
      for (var callSeg = 0; callSeg < cdrArray.length; callSeg++) {
        for (var i = 0; i < cdrArray[callSeg].length; i++) {
          totalDuration += cdrArray[callSeg][i].dataParam.duration;
          if (cdrArray[callSeg][i]['@timestamp'] < firstTimestamp) {
            firstTimestamp = cdrArray[callSeg][i]['@timestamp'];
          }
          numberOfCdrs++;
        }
      }
      return $translate.instant("cdrLogs.cdrAccordionHeader", {
        firstTimestamp: firstTimestamp,
        numberOfCdrs: numberOfCdrs,
        totalDuration: totalDuration
      });
    }

    function setupScrolling(gridData) {
      $timeout(function () {
        angular.forEach(gridData, function (item, index, array) {
          var scroll = $('#cdrtable' + index).getNiceScroll();
          if (scroll.length > 0) {
            scroll.remove();
          }

          $('#cdrtable' + index).niceScroll({
            cursorcolor: Config.chartColors.gray,
            cursorborder: "0px",
            cursorwidth: "7px",
            railpadding: {
              top: 0,
              right: 3,
              left: 0,
              bottom: 0
            },
            autohidemode: "leave"
          });
          $('#cdrtable' + index).getNiceScroll().resize();
        });
      }, 2000);
    }

    function selectCDR(selectedCDR, call) {
      vm.selectedCDR = selectedCDR;
      $state.go('cdr-overview', {
        cdrData: vm.selectedCDR,
        call: call
      });
    }
  }
})();
