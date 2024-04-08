import Vue from 'vue';
import { _CREATE } from '@shell/config/query-params';
import { ANNOTATIONS_TO_IGNORE_REGEX, LABELS_TO_IGNORE_REGEX } from '@shell/config/labels-annotations';
import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import { matchesSomeRegex } from '@shell/utils/string';
import { downloadFile } from '@shell/utils/download';
import { ELEMENTAL_DEFAULT_NAMESPACE } from '../types';
import ElementalResource from './elemental-resource';

export const OLD_DEFAULT_CREATION_YAML = `config:
  cloud-config:
    users:
    - name: root
      passwd: root
  elemental:
    install:
      poweroff: true
      device: /dev/nvme0n1`;

export const DEFAULT_CREATION_YAML = `config:
  cloud-config:
    users:
    - name: root
      passwd: root
  elemental:
    install:
      reboot: true
      device-selector:
      - key: Name
        operator: In
        values:
        - /dev/sda
        - /dev/vda
        - /dev/nvme0
      - key: Size
        operator: Gt
        values:
        - 25Gi
      snapshotter:
        type: btrfs`;

export default class MachineRegistration extends ElementalResource {
  applyDefaults(vm, mode) {
    if ( !this.spec || mode === _CREATE ) {
      Vue.set(this, 'spec', {});
    }
    if ( !this.metadata || mode === _CREATE ) {
      Vue.set(this, 'metadata', { namespace: ELEMENTAL_DEFAULT_NAMESPACE });
    }
  }

  setLabels(val, prop = 'labels', isSpec = false) {
    if (isSpec && !this.spec) {
      this.spec = {};
    } else if ( !this.metadata ) {
      this.metadata = {};
    }

    let all = this.metadata[prop] || {};

    if (isSpec) {
      all = this.spec[prop] || {};
    }

    const wasIgnored = pickBy(all, (value, key) => {
      return matchesSomeRegex(key, LABELS_TO_IGNORE_REGEX);
    });

    if (isSpec) {
      Vue.set(this.spec, prop, { ...wasIgnored, ...val });
    } else {
      Vue.set(this.metadata, prop, { ...wasIgnored, ...val });
    }
  }

  setAnnotations(val, prop = 'annotations', isSpec = false) {
    if (isSpec && !this.spec) {
      this.spec = {};
    } else if ( !this.metadata ) {
      this.metadata = {};
    }

    let all = this.metadata[prop] || {};

    if (isSpec) {
      all = this.spec[prop] || {};
    }

    const wasIgnored = pickBy(all, (value, key) => {
      return matchesSomeRegex(key, ANNOTATIONS_TO_IGNORE_REGEX);
    });

    if (isSpec) {
      Vue.set(this.spec, prop, { ...wasIgnored, ...val });
    } else {
      Vue.set(this.metadata, prop, { ...wasIgnored, ...val });
    }
  }

  get machineInventoryLabels() {
    const all = this.spec?.machineInventoryLabels || {};

    return omitBy(all, (value, key) => {
      return matchesSomeRegex(key, LABELS_TO_IGNORE_REGEX);
    });
  }

  get machineInventoryAnnotations() {
    const all = this.spec?.machineInventoryAnnotations || {};

    return omitBy(all, (value, key) => {
      return matchesSomeRegex(key, ANNOTATIONS_TO_IGNORE_REGEX);
    });
  }

  async getMachineRegistrationData() {
    const url = `/elemental/registration/${ this.status.registrationToken }`;

    try {
      const inStore = this.$rootGetters['currentStore']();
      const res = await this.$dispatch(`${ inStore }/request`, { url, responseType: 'blob' }, { root: true });
      const machineRegFileName = `${ this.metadata.name }_registrationURL.yaml`;

      return {
        data:     res.data,
        fileName: machineRegFileName
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async downloadMachineRegistration() {
    try {
      const machineReg = await this.getMachineRegistrationData();

      return downloadFile(machineReg.fileName, machineReg.data, 'text/markdown; charset=UTF-8');
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
