import { SettingSection } from './settingSection';

export class SecuritySetting extends SettingSection {

  /* @ngInject */
  public constructor() {
    super('security');
    this.subsectionDescription = '';
  }
}
angular.module('Core').component('securitySetting', {
  controller: 'SecuritySettingController as secCtrl',
  templateUrl: 'modules/core/settings/security/securitySetting.tpl.html',
});
