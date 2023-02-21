import Vue from 'vue';
import { _CREATE } from '@shell/config/query-params';
import { ELEMENTAL_DEFAULT_NAMESPACE } from '../types';
import ElementalResource from './elemental-resource';

export default class ManagedOsImage extends ElementalResource {
  applyDefaults(vm, mode) {
    if ( !this.spec ) {
      Vue.set(this, 'spec', { osImage: '', clusterTargets: [] });
    }
    if ( !this.metadata || mode === _CREATE ) {
      Vue.set(this, 'metadata', { namespace: ELEMENTAL_DEFAULT_NAMESPACE });
    }
  }

  get clusterTargetsList() {
    if (this.spec?.clusterTargets?.length) {
      let val = '';

      this.spec.clusterTargets.forEach((target, i) => {
        val += target.clusterName;
        if (i !== this.spec.clusterTargets.length - 1) {
          val += ', ';
        }
      });

      return val || '---';
    }

    return '---';
  }
}
