import { KIND } from '../config/elemental-types';

export function filterForElementalClusters(clusters) {
  return clusters.filter(cluster => cluster.spec?.rkeConfig?.machinePools?.length &&
  cluster.spec?.rkeConfig?.machinePools[0].machineConfigRef.kind === KIND.MACHINE_INV_SELECTOR_TEMPLATES);
}

export function filterForUsedElementalClustersOnManagedOs(elementalClusters, osGroups) {
  const out = [...elementalClusters];

  osGroups.forEach((group) => {
    group.spec?.clusterTargets?.forEach((target) => {
      if (elementalClusters.find(c => c.name === target.clusterName)) {
        const index = out.findIndex(c => c.name === target.clusterName);

        out.splice(index, 1);
      }
    });
  });

  return out;
}
