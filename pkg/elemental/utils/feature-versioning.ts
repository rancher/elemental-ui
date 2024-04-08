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

// features to be gated to specific operator versions
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
 * @param any Vue store
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
 * Check the gated feature compatibility with the current Elemental Operator version installed
 * @param string resource type (ex: Deployment)
 * @param string UI mode (ex: edit, create, view)
 * @param string Elemental feature (ex: Build media, cloud config)
 * @param string Elemental Operator version
 * @returns Boolean
 */
export function checkGatedFeatureCompatibility(resource: string, mode: string, feature: string, operatorVersion: string): Boolean {
  if (resource && mode && feature) {
    const gatedFeature = FEATURES_GATING.find(feat => feat.area === resource && feat.mode.includes(mode) && feat.features.includes(feature));

    if (!gatedFeature?.minOperatorVersion || !operatorVersion) {
      return false;
    }

    return semver.gte(operatorVersion, gatedFeature?.minOperatorVersion);
  }

  return false;
}
