import semver from 'semver';

import { _CREATE, _EDIT, _VIEW } from '@shell/config/query-params';
import { CATALOG } from '@shell/config/types';
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
    minOperatorVersion: '103.0.0',
    features:           [MACH_REG_CONFIG_DEFAULTS]
  },
  {
    area:               ELEMENTAL_TYPES.DASHBOARD,
    mode:               [_VIEW],
    minOperatorVersion: '103.0.0',
    features:           [BUILD_MEDIA_RAW_SUPPORT]
  },
  {
    area:               ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
    mode:               [_VIEW],
    minOperatorVersion: '103.0.0',
    features:           [BUILD_MEDIA_RAW_SUPPORT]
  }
];

/**
 * Get the current elemental-operator version
 * @param any store
 * @param any alreadyInstalledApps
 * @returns Promise<string | void>
 */
export async function getOperatorVersion(store: any, alreadyInstalledApps:any = null, isRoot:Boolean = false): Promise<string | void> {
  if (alreadyInstalledApps) {
    const operator = alreadyInstalledApps?.find((item: any) => item.id.includes('elemental-operator') && !item.id.includes('elemental-operator-crds'));

    return operator?.versionDisplay;
  }

  // needed to check if operator is installed
  if (store.getters['management/canList'](CATALOG.APP)) {
    const installedApps = await store.dispatch('management/findAll', { type: CATALOG.APP }, { root: isRoot });
    const operator = installedApps?.find((item: any) => item.id.includes('elemental-operator') && !item.id.includes('elemental-operator-crds'));

    return operator?.versionDisplay;
  }

  return '';
}

/**
 * Get all of the gated features based on resource + mode + string
 * @param string
 * @param string
 * @param string
 * @returns FeaturesGatingConfig[] | [] | void
 */
export function getGatedFeatures(resource: string, mode: string, feature: string): FeaturesGatingConfig[] | [] | void {
  if (resource && mode) {
    return FEATURES_GATING.filter(feat => feat.area === resource && feat.mode.includes(mode) && feat.features.includes(feature));
  }

  return [];
}

/**
 * Determines if a given feature is enabled by doing a semver version comparison
 * @param string
 * @param string
 * @returns Boolean | void
 */
export function semverVersionCheck(operatorVersion: string, limitVersion: string): Boolean | void {
  return semver.gte(operatorVersion, limitVersion);
}
