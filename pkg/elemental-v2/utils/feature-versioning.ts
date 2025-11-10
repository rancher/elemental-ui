import semver from 'semver';

import { _CREATE, _EDIT, _VIEW, _DETAIL } from '@shell/config/query-params';
import { ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';
import { ELEMENTAL_TYPES } from '../types';

interface FeaturesGatingConfig {
  area: string,
  mode: string[],
  minOperatorVersion: string,
  features: string[],
}

export const ALL_AREAS:string = 'all-areas';
export const ALL_MODES:string = 'all-modes';

// features to be gated to specific operator versions
export const MACH_REG_CONFIG_DEFAULTS:string = 'machine-reg-config-defaults';
export const BUILD_MEDIA_RAW_SUPPORT:string = 'build-media-raw-support';
export const BUILD_MEDIA_ARCH_SUPPORT:string = 'build-media-arch-support';
export const DELETE_NO_LONGER_IN_SYNC_CHANNELS:string = 'delete-no-longer-in-sync-channels';
export const CHANNEL_NO_LONGER_IN_SYNC:string = 'channel-no-longer-in-sync';

const FEATURES_GATING:FeaturesGatingConfig[] = [
  {
    area:               ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
    mode:               [_CREATE],
    minOperatorVersion: '1.6.2',
    features:           [MACH_REG_CONFIG_DEFAULTS]
  },
  {
    area:               ELEMENTAL_TYPES.DASHBOARD,
    mode:               [_VIEW],
    minOperatorVersion: '1.6.2',
    features:           [BUILD_MEDIA_RAW_SUPPORT]
  },
  {
    area:               ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
    mode:               [_VIEW],
    minOperatorVersion: '1.6.2',
    features:           [BUILD_MEDIA_RAW_SUPPORT]
  },
  {
    area:               ELEMENTAL_TYPES.DASHBOARD,
    mode:               [_VIEW],
    minOperatorVersion: '1.6.3',
    features:           [BUILD_MEDIA_ARCH_SUPPORT]
  },
  {
    area:               ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
    mode:               [_VIEW],
    minOperatorVersion: '1.6.3',
    features:           [BUILD_MEDIA_ARCH_SUPPORT]
  },
  {
    area:               ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS,
    mode:               [_CREATE, _EDIT, _DETAIL, _VIEW],
    minOperatorVersion: '1.6.3',
    features:           [DELETE_NO_LONGER_IN_SYNC_CHANNELS]
  },
  {
    area:               ALL_AREAS,
    mode:               [ALL_MODES],
    minOperatorVersion: '1.6.3',
    features:           [CHANNEL_NO_LONGER_IN_SYNC]
  }
];

/**
 * Get the current elemental-operator version
 * @param any Vue store
 * @returns Promise<string | void>
 */
export async function getOperatorVersion(store: any): Promise<string | void> {
  // needed to check operator version installed (on a custom CRD called metadata, which is installed/created from elemental-operator)
  if (store.getters['management/canList'](ELEMENTAL_SCHEMA_IDS.METADATA)) {
    const elementalOperatorMetadata = await store.dispatch('management/find', { type: ELEMENTAL_SCHEMA_IDS.METADATA, id: 'cattle-elemental-system/elemental-operator' });

    return elementalOperatorMetadata?.spec?.appVersion || '0.1.0';
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
