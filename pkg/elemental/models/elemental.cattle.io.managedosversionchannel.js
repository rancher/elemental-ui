import Vue from 'vue';
import { _CREATE } from '@shell/config/query-params';
import { ELEMENTAL_DEFAULT_NAMESPACE } from '../types';
import ElementalResource from './elemental-resource';

export default class ManagedOsVersionChannel extends ElementalResource {
  applyDefaults(vm, mode) {
    if ( !this.spec ) {
      Vue.set(this, 'spec', { options: { image: '' }, type: 'custom' });
    }
    if ( !this.metadata || mode === _CREATE ) {
      Vue.set(this, 'metadata', { namespace: ELEMENTAL_DEFAULT_NAMESPACE });
    }
  }
}
