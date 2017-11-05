(function () {
  'use strict';

  angular.module('uc.cdrlogsupport')
    .service('CdrLadderDiagramService', CdrLadderDiagramService);

  /* @ngInject */
  function CdrLadderDiagramService($http, $q, Log, UrlConfig) {
    var callflowDiagramUrl = UrlConfig.getAdminServiceUrl() + 'callflow/ladderdiagram';
    var getActivitiesUrl = UrlConfig.getAdminServiceUrl() + 'callflow/activities';
    var TIMEOUT_IN_MILI = 15000;
    var TRANSITION_ARROW = "-[#009933]>";
    var SME_NODE = 'SME';
    var serviceName = "Diagnostics Server";
    var retryError = "ElasticSearch GET request failed for reason: Observable onError";
    var skinParam = "skinparam backgroundColor #EEEBDC \n" +
      "  skinparam sequence { \n" +
      "  ArrowColor DeepSkyBlue  \n" +
      "  ActorBorderColor DeepSkyBlue \n" +
      "  LifeLineBorderColor blue \n" +
      "  LifeLineBackgroundColor #A9DCDF \n" +
      "  ParticipantBorderColor DeepSkyBlue \n" +
      "  ParticipantBackgroundColor DodgerBlue \n" +
      "  ParticipantFontName Impact \n" +
      "  ParticipantFontSize 17 \n" +
      "  ParticipantFontColor #A9DCDF \n" +
      "  ActorBackgroundColor aqua \n" +
      "  ActorFontColor DeepSkyBlue \n" +
      "  ActorFontSize 17 \n" +
      "  ActorFontName Aapex \n" +
      "} \n" +
      "actor \"Start Point\" \n";

    var svc = this;
    svc.events = null;

    function generateMessagebody(events) {
      var messageBody = '@startuml \n autonumber "<b>[0]"\n';
      var source = '';
      var remote = '';
      var note = '';
      var eventNote = '';

      messageBody += skinParam;

      for (var i = 0; i < events.length; i++) {
        if (events[i].type !== 'ApplicationEvents' && events[i].type !== undefined) {
          if (events[i].eventSource.hostname !== undefined && events[i].dataParam.direction !== undefined) {
            // standard event
            source = getSourceAlias(events[i]);
            remote = getRemoteAlias(events[i]);
            note = getNote(events[i]);

            if (source === null || source === "") {
              source = SME_NODE;
            }

            if (remote === null || remote === "") {
              remote = SME_NODE;
            }

            //incommig call
            if (events[i].dataParam.direction === 'in') {
              if (!_.isUndefined(events[i].dataParam.callflowTransition) && (events[i].dataParam.callflowTransition)) {
                messageBody += '"' + remote + '"' + TRANSITION_ARROW + '"' + source + '"' + ': ';
              } else {
                messageBody += '"' + remote + '"' + '->' + '"' + source + '"' + ': ';
              }
            } else {
              if (!_.isUndefined(events[i].dataParam.callflowTransition) && (events[i].dataParam.callflowTransition)) {
                messageBody += '"' + source + '"' + TRANSITION_ARROW + '"' + remote + '"' + ': ';
              } else {
                messageBody += '"' + source + '"' + '->' + '"' + remote + '"' + ': ';
              }
            }

            eventNote = note;
            eventNote += events[i].dataParam.msgType;
            messageBody += '"' + eventNote.replace('"', ' ') + '"\n';
          }
        }
      }
      messageBody += '@enduml';
      return messageBody;
    }

    function getSourceAlias(event) {
      if (event.eventSource.hostname !== undefined) {
        if (event.eventSource.hostname.indexOf('line') > -1 && event.eventSource.hostname.indexOf('hedge') > -1) {
          return 'Line Hedge';
        } else if ((event.eventSource.hostname.indexOf('trunk') > -1 && event.eventSource.hostname.indexOf('hedge') > -1) || event.eventSource.hostname.indexOf('cisco') === 0) {
          return 'Trunk Hedge';
        } else {
          return _.replace(event.eventSource.hostname, /-/g, '\\-');
        }
      }
    }

    function getRemoteAlias(event) {
      if (!_.isUndefined(event.dataParam.remoteAlias)) {
        if (event.dataParam.remoteAlias.indexOf('Cisco') > -1 && event.dataParam.remoteAlias.indexOf('SME') > -1) {
          return SME_NODE;
        }
      }
      if (!_.isUndefined(event.dataParam.remoteName) && !_.isUndefined(event.eventSource.hostname)) {
        if (event.dataParam.remoteName.match(/^[0-9a-zA-Z]+$/i) && event.eventSource.hostname.indexOf('cms') > -1) {
          return 'Line Hedge';
        } else if (event.dataParam.remoteName.match(/^[0-9a-zA-Z]+$/i) && event.eventSource.hostname.indexOf('sme') > -1) {
          return 'Trunk Hedge';
        } else if (event.dataParam.remoteName.indexOf('COMMON') > -1 && (event.dataParam.remoteName.indexOf('SME') > -1 || event.dataParam.remoteName.indexOf('CMS') > -1)) {
          return 'Common CMS/SME';
        } else if (event.dataParam.remoteName.indexOf('COMMON') > -1 && event.dataParam.remoteName.indexOf('SQUARED') > -1) {
          return 'Common Squared';
        } else if (event.dataParam.remoteName.indexOf('COMMON') > -1 && event.dataParam.remoteName.indexOf('CISCO') > -1) {
          return 'Trunk Hedge';
        } else {
          return _.replace(event.dataParam.remoteName, /-/g, '\\-');
        }
      } else if (!_.isUndefined(event.eventSource.hostname)) {
        if (event.eventSource.hostname.indexOf('line') > -1) {
          return 'Start Point';
        } else {
          return 'End Point';
        }
      }
    }

    function getNote(event) {
      if (event.dataParam.remoteName !== undefined && event.dataParam.remoteName.match(/^[0-9a-zA-Z]+$/i)) {
        return event.dataParam.remoteName + ' ';
      }
      return '';
    }

    svc.query = function (esQuery, logstashPath) {
      var cdrUrl = UrlConfig.getCdrUrl() + logstashPath + "/_search?pretty";
      var defer = $q.defer();
      $http({
        method: "POST",
        url: cdrUrl,
        data: esQuery,
        timeout: TIMEOUT_IN_MILI
      }).success(function (response) {
        defer.resolve(response);
      }).error(function (response, status) {
        // if this specific error is received, retry once; error caused by hystrix connection timeout
        if (status === 500 && response === retryError) {
          $http({
            method: "POST",
            url: cdrUrl,
            data: esQuery,
            timeout: TIMEOUT_IN_MILI
          }).success(function (secondaryResponse) {
            defer.resolve(secondaryResponse);
          }).error(function (secondaryResponse, secondaryStatus) {
            defer.reject({
              'response': secondaryResponse,
              'status': secondaryStatus
            });
          });
        } else {
          defer.reject({
            'response': response,
            'status': status
          });
        }
      });
      return defer.promise;
    };

    function proxyDiagnosticService(message) {
      var defer = $q.defer();
      $http({
        method: "POST",
        url: callflowDiagramUrl,
        data: {
          "data": message
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/xml'
        }
      })
        .success(function (response) {
          defer.resolve(response);
        })
        .error(function (response, status) {
          Log.debug('Failed to retrieve ladder diagram from ' + serviceName + ' server.');
          defer.reject({
            'response': response,
            'status': status
          });
        });
      return defer.promise;
    }

    svc.createLadderDiagram = function (events) {
      svc.events = events;
      var message = generateMessagebody(_.sortBy(svc.events, '@timestamp'));
      return proxyDiagnosticService(message);
    };

    svc.getActivities = function (locusid, start, end) {
      var defer = $q.defer();
      $http({
        method: "GET",
        url: getActivitiesUrl + "?id=lid." + locusid + "&start=" + start + "&end=" + end,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
        .success(function (response) {
          defer.resolve(response);
        })
        .error(function (response, status) {
          Log.debug('Failed to retrieve ladder diagram from ' + serviceName + ' server.');
          defer.reject({
            'response': response,
            'status': status
          });
        });
      return defer.promise;
    };

    return svc;
  }

})();
