export class AvailabilityMetrics implements ng.IComponentOptions {
  public templateUrl = 'modules/mediafusion/metrics-graph-report/availability/availability.tpl.html';
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucAvailabilityMetrics', new AvailabilityMetrics());
