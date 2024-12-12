import semver from 'semver';
import isEmpty from 'lodash/isEmpty';
import { KIND } from '../config/elemental-types';

export function filterForElementalClusters(clusters) {
  return clusters.filter(cluster => cluster.spec?.rkeConfig?.machinePools?.length &&
  cluster.spec?.rkeConfig?.machinePools[0].machineConfigRef.kind === KIND.MACHINE_INV_SELECTOR_TEMPLATES);
}

export function filterForUsedElementalClustersOnManagedOs(elementalClusters, osGroups, id) {
  const out = [...elementalClusters];

  // filter out clusters that are in use by other ManagedOsVersion's
  osGroups.forEach((group) => {
    group.spec?.clusterTargets?.forEach((target) => {
      if (elementalClusters.find(c => c.name === target.clusterName && group.id !== id)) {
        const index = out.findIndex(c => c.name === target.clusterName);

        out.splice(index, 1);
      }
    });
  });
  return out;
}

export function getLatestStableVersion(versions) {
  const allVersions = versions.map(v => v.version);
  const stableVersions = versions.filter(v => !v.version.includes('rc'));

  if ( isEmpty(stableVersions) && !isEmpty(allVersions) ) {
    return semver.rsort(allVersions)[0];
  }

  return stableVersions?.sort((a, b) => {
    const versionA = a.version.split('.').map(Number);
    const versionB = b.version.split('.').map(Number);

    for ( let i = 0; i < Math.max(versionA.length, versionB.length); i++ ) {
      if ( versionA[i] === undefined || versionA[i] < versionB[i] ) {
        return 1;
      }
      if ( versionB[i] === undefined || versionA[i] > versionB[i] ) {
        return -1;
      }
    }

    return 0;
  })[0];
}

export function handleGrowl(config) {
  const error = config.error?.data || config.error;

  config.store.dispatch(`growl/${ config.type || 'error' }`, {
    title:   error._statusText,
    message: error.message,
    timeout: 5000,
  }, { root: true });
}
