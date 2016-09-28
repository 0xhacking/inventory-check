(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard(FusionClusterService, FusionClusterStatesService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.name = 'overview.cards.hybrid.title';
        card.cardClass = 'header-bar gray-light hybrid-card';
        card.template = 'modules/core/overview/hybridServicesCard.tpl.html';
        card.icon = 'icon-circle-data';
        card.enabled = false;
        card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
        card.notEnabledAction = 'https://www.cisco.com/go/hybrid-services';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.serviceList = [];

        function init() {
          FusionClusterService.getAll()
            .then(function (clusterList) {
              card.serviceList.push(FusionClusterService.getStatusForService('squared-fusion-cal', clusterList));
              card.serviceList.push(FusionClusterService.getStatusForService('squared-fusion-uc', clusterList));
              card.serviceList.push(FusionClusterService.getStatusForService('squared-fusion-media', clusterList));
              card.enabled = _.some(card.serviceList, function (service) {
                return service.setup;
              });
              if (card.enabled) {
                _.each(card.serviceList, function (service) {
                  service.UIstateLink = getUIStateLink(service.serviceId);
                  service.healthStatus = FusionClusterStatesService.getStatusIndicatorCSSClass(service.status);
                });
              }
            });
        }
        init();

        function getUIStateLink(serviceId) {
          if (serviceId === 'squared-fusion-uc') {
            return 'call-service.list';
          } else if (serviceId === 'squared-fusion-cal') {
            return 'calendar-service.list';
          } else if (serviceId === 'squared-fusion-media') {
            return 'media-service-v2.list';
          }
        }

        return card;
      }
    };
  }
})();
