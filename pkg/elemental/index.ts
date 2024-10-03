import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import elementalRouting from './routing/elemental-routing';
import elementalStore from './store/elemental-store';

// fix missing directives on dashboard v2.7.2
// doesn't seem to have any side effect while runnning on v2.7-head
// where the directive is already present
// import '@shell/plugins/clean-tooltip-directive';
// import '@shell/plugins/clean-html-directive';

// Init the package
export default function($plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes($plugin);

  // Provide plugin metadata from package.json
  $plugin.metadata = require('./package.json');

  // Load a product
  $plugin.addProduct(require('./elemental-config'));

  // Add Vuex store
  $plugin.addDashboardStore(elementalStore.config.namespace, elementalStore.specifics, elementalStore.config);

  // Add Vue Routes
  $plugin.addRoutes(elementalRouting);
}
