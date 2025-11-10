import { _CREATE } from '@shell/config/query-params';
import { ELEMENTAL_DEFAULT_NAMESPACE } from '../types';
import ElementalResource from './elemental-resource';

export default class ManagedOsVersionChannel extends ElementalResource {
  applyDefaults(vm, mode) {
    if ( !this.spec ) {
      this.spec = { options: { image: '' }, type: 'custom' }
    }
    if ( !this.metadata || mode === _CREATE ) {
      this.metadata = { namespace: ELEMENTAL_DEFAULT_NAMESPACE }
    }
  }
}
