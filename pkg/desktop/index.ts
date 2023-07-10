import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import routing from './routing/routing';

// fix missing directives on dashboard v2.7.2
// doesn't seem to have any side effect while runnning on v2.7-head
// where the directive is already present
import '@shell/plugins/clean-tooltip-directive';
import '@shell/plugins/clean-html-directive';

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./product'));

  // Add Vue Routes
  plugin.addRoutes(routing);
}
