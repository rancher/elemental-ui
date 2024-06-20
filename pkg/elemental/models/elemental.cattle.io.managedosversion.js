import ElementalResource from './elemental-resource';

export default class ManagedOsVersion extends ElementalResource {
  get inSync() {
    return this.spec?.type === 'iso' && Object.keys(this.metadata?.annotations || {}).includes('elemental.cattle.io/channel-no-longer-in-sync') ? !this.metadata?.annotations['elemental.cattle.io/channel-no-longer-in-sync'] : '---';
  }
}
