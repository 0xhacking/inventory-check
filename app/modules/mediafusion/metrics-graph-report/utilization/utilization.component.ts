export class UtilizationMetrics implements ng.IComponentOptions {
  public templateUrl = 'modules/mediafusion/metrics-graph-report/utilization/utilization.tpl.html';
  public bindings = {
    parentcntrl: '=',
  };
}
angular.module('Mediafusion').component('ucUtilizationMetrics', new UtilizationMetrics());
