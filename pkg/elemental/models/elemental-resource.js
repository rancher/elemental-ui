import SteveModel from '@shell/plugins/steve/steve-class';
import { clone } from '@shell/utils/object';
import { createElementalRoute } from '../utils/custom-routing';
import { ELEMENTAL_PRODUCT_NAME } from '../config/elemental-types';

export default class ElementalResource extends SteveModel {
  get listLocation() {
    return createElementalRoute('resource', { resource: this.type });
  }

  get detailLocation() {
    const schema = this.$getters['schemaFor'](this.type);
    const detailLocation = clone(this._detailLocation);

    detailLocation.params.resource = this.type;

    if (schema?.attributes?.namespaced) {
      detailLocation.name = `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-namespace-id`;
    } else {
      detailLocation.name = `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-id`;
    }

    return detailLocation;
  }

  get parentLocationOverride() {
    return this.listLocation;
  }

  get doneRoute() {
    return this.listLocation.name;
  }

  /**
   * The shell's `cleanForDownload` store action changed payload shape in @rancher/shell 3.0.14:
   * the model dispatches `{ yaml, opt }` instead of the yaml string. Newer shells accept both,
   * but older Rancher hosts (2.15.0-alpha9 and earlier) only understand the string and end up
   * running `jsyaml.load({ yaml, opt })`, which renders as `- object Object` in the YAML view.
   *
   * The extension bundles its own (newer) copy of the shell while the action runs in the host,
   * so we always dispatch the legacy string shape, which every shell version understands.
   */
  async cleanForDownload(yaml) {
    return this.$dispatch('cleanForDownload', yaml);
  }
}
