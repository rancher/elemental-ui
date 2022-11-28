import SteveModel from '@shell/plugins/steve/steve-class';
import { clone } from '@shell/utils/object';
import { createElementalRoute } from '../utils/custom-routing';
import { ELEMENTAL_PRODUCT_NAME } from '../config/elemental-types';

export default class ElementalResource extends SteveModel {
  get listLocation() {
    return createElementalRoute('resource', { resource: this.type });
  }

  get detailLocation() {
    const detailLocation = clone(this._detailLocation);

    detailLocation.params.resource = this.type;

    if (detailLocation.name.includes('namespace')) {
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
}
