import semver from 'semver';

import { _CREATE, _VIEW } from '@shell/config/query-params';
import { WORKLOAD_TYPES } from '@shell/config/types';
import { ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';
import { ELEMENTAL_TYPES } from '../types';

interface FeaturesGatingConfig {
  area: string,
  mode: string[],
  minOperatorVersion: string,
  features: string[],
}

export const MACH_REG_CONFIG_DEFAULTS:string = 'machine-reg-config-defaults';
export const BUILD_MEDIA_RAW_SUPPORT:string = 'build-media-raw-support';

const FEATURES_GATING:FeaturesGatingConfig[] = [
  {
    area:               ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
    mode:               [_CREATE],
    minOperatorVersion: '1.6.0',
    features:           [MACH_REG_CONFIG_DEFAULTS]
  },
  {
    area:               ELEMENTAL_TYPES.DASHBOARD,
    mode:               [_VIEW],
    minOperatorVersion: '1.6.0',
    features:           [BUILD_MEDIA_RAW_SUPPORT]
  },
  {
    area:               ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
    mode:               [_VIEW],
    minOperatorVersion: '1.6.0',
    features:           [BUILD_MEDIA_RAW_SUPPORT]
  }
];

/**
 * Get the current elemental-operator version
 * @param any store
 * @param any alreadyInstalledApps
 * @returns Promise<string | void>
 */
export async function getOperatorVersion(store: any): Promise<string | void> {
  // needed to check operator version installed (on the deployment)
  if (store.getters['management/canList'](WORKLOAD_TYPES.DEPLOYMENT)) {
    const elementalOperatorDeployment = await store.dispatch('management/find', { type: WORKLOAD_TYPES.DEPLOYMENT, id: 'cattle-elemental-system/elemental-operator' });

    return elementalOperatorDeployment?.metadata?.labels?.['app.kubernetes.io/version'] || '0.1.0';
  }

  return '0.1.0';
}

/**
 * Get the gated feature based on resource + mode + string
 * @param string
 * @param string
 * @param string
 * @returns FeaturesGatingConfig | {} | void
 */
export function getGatedFeature(resource: string, mode: string, feature: string): FeaturesGatingConfig | {} | void {
  if (resource && mode) {
    return FEATURES_GATING.find(feat => feat.area === resource && feat.mode.includes(mode) && feat.features.includes(feature));
  }

  return {};
}

/**
 * Determines if a given feature is enabled by doing a semver version comparison
 * @param string
 * @param string
 * @returns Boolean | void
 */
export function semverVersionCheck(operatorVersion: string, operatorMinVersion: string): Boolean | void {
  return semver.gte(operatorVersion, operatorMinVersion);
}
