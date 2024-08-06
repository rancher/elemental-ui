import ElementalResource from './elemental-resource';

export default class ManagedOsVersion extends ElementalResource {
  get inSyncFormatterText() {
    if (Object.keys(this.metadata?.annotations || {}).includes('elemental.cattle.io/channel-no-longer-in-sync')) {
      return this.metadata?.annotations['elemental.cattle.io/channel-no-longer-in-sync'] === 'true' ? this.t('elemental.osVersions.outOfSync') : this.t('elemental.osVersions.inSync');
    } else {
      return this.t('elemental.osVersions.inSync');
    }
  }

  get inSync() {
    if (Object.keys(this.metadata?.annotations || {}).includes('elemental.cattle.io/channel-no-longer-in-sync')) {
      return this.metadata?.annotations['elemental.cattle.io/channel-no-longer-in-sync'] !== 'true';
    } else {
      return true;
    }
  }
}
