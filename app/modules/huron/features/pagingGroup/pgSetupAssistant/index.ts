import { PgSetupAssistantComponent } from './pgSetupAssistant.component';

import pgName from './pgName';
import pgNumber from './pgNumber';
import pgMember from './pgMember';

export default angular
  .module('huron.paging-group.setup-assistant', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    pgName,
    pgNumber,
    pgMember
  ])
  .component('pgSetupAssistant', new PgSetupAssistantComponent())
  .name;
