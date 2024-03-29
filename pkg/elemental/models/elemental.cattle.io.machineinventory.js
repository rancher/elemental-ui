
import { CAPI } from '@shell/config/types';
import { randomStr, escapeHtml } from '@shell/utils/string';
import { exceptionToErrorsArray } from '@shell/utils/error';
import { ELEMENTAL_CLUSTER_PROVIDER, ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';
import { ELEMENTAL_DEFAULT_NAMESPACE } from '../types';
import ElementalResource from './elemental-resource';

export default class MachineInventory extends ElementalResource {
  constructor() {
    super(...arguments);

    if (!this.metadata) {
      this.metadata = {};
    }

    // we want to default to namespace XXX for creation scenario...
    if (!this.id) {
      this.metadata.namespace = ELEMENTAL_DEFAULT_NAMESPACE;
    }
  }

  get _availableActions() {
    const out = super._availableActions;

    if (this.cannotBeDeletedByUi) {
      const i = out.findIndex(act => act.action === 'promptRemove');

      if (i >= 0) {
        out.splice(i, 1);
      }
    }

    if (this.canCreateCluster) {
      out.push({
        action:     'createCluster',
        bulkAction: 'createCluster',
        label:      this.t('elemental.machineInventory.createCluster'),
        enabled:    true,
        bulkable:   true
      });
    }

    return out;
  }

  get canCreateCluster() {
    const schema = this.$rootGetters['management/schemaFor'](CAPI.RANCHER_CLUSTER);

    return !!schema?.collectionMethods.find(x => x.toLowerCase() === 'post');
  }

  createCluster(elems) {
    const promises = [];
    const randomId = randomStr(24);

    const createClusterElements = elems && elems.length ? elems : [this];

    createClusterElements.forEach((item) => {
      item.setLabel('create-cluster-selector', randomId);
      promises.push(item.save());
    });

    Promise.all(promises).then((res) => {
      this.$dispatch('elemental/updateCreateClusterElements', res, { root: true });

      this.currentRouter().push({
        name:   'c-cluster-product-resource-create',
        params: {
          resource: CAPI.RANCHER_CLUSTER,
          product:  'manager',
        },
        query: { type: ELEMENTAL_CLUSTER_PROVIDER }
      });
    }, (err) => {
      const errors = exceptionToErrorsArray(err);

      this.$dispatch('growl/fromError', {
        title: this.$rootGetters['i18n/t']('elemental.machineInventory.updateForCreateClusterError'),
        err:   errors[0]
      }, { root: true });
    });
  }

  get clusterName() {
    if (this.metadata.ownerReferences && this.metadata.ownerReferences.length) {
      const invSelectorName = this.metadata.ownerReferences[0].name;

      const machineInvSelector = this.$getters['all'](ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR).find(item => item.metadata.name === invSelectorName);

      if (machineInvSelector && machineInvSelector.metadata?.labels && machineInvSelector.metadata?.labels['rke.cattle.io/cluster-name']) {
        return machineInvSelector.metadata?.labels['rke.cattle.io/cluster-name'];
      }
    }

    return null;
  }

  get groupByCluster() {
    const name = this.clusterName;

    if (name) {
      return this.$rootGetters['i18n/t']('resourceTable.groupLabel.cluster', { name: escapeHtml(name) });
    } else {
      return this.$rootGetters['i18n/t']('resourceTable.groupLabel.notInACluster');
    }
  }

  get cannotBeDeletedByUi() {
    let cannotBeDeletedByUi = false;

    if (this.status?.conditions && this.status?.conditions.find(c => c.type === 'AdoptionReady' && c.status === 'True')) {
      cannotBeDeletedByUi = true;
    }

    return cannotBeDeletedByUi;
  }
}
