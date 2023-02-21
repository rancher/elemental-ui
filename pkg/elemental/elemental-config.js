
import { STATE, NAME as NAME_COL, AGE, NAMESPACE as NAMESPACE_COL } from '@shell/config/table-headers';
import { ELEMENTAL_SCHEMA_IDS } from './config/elemental-types';
import { ELEMENTAL_TYPES } from './types';
import { createElementalRoute, rootElementalRoute } from './utils/custom-routing';

export function init($plugin, store) {
  const {
    product, virtualType, basicType, configureType, weightType, headers
  } = $plugin.DSL(store, $plugin.name);

  // app in sidebar
  product({
    icon:                'os-management',
    inStore:             'management',
    removable:           false,
    showClusterSwitcher: false,
    to:                  rootElementalRoute()
  });

  // dashboard menu entry in Elemental
  virtualType({
    label:        store.getters['i18n/t']('elemental.menuLabels.dashboard'),
    icon:         'folder',
    group:        'Root',
    namespaced:   false,
    name:         ELEMENTAL_TYPES.DASHBOARD,
    weight:      10,
    route:        rootElementalRoute()
  });

  // registering Elemental resources
  weightType(ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS, 9, true);
  configureType(ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS, {
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    canYaml:     true,
    customRoute: createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS })
  });

  weightType(ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES, 8, true);
  configureType(ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES, {
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    canYaml:     true,
    customRoute: createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES }),
    listGroups:  [
      {
        icon:       'icon-cluster',
        value:      'clusterName',
        field:      'groupByCluster',
        hideColumn: 'clusterName',
        tooltipKey: 'resourceTable.groupBy.cluster'
      }
    ]
  });

  headers(ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES, [
    STATE,
    NAME_COL,
    {
      name:          'Cluster',
      labelKey:      'tableHeaders.cluster',
      value:         'clusterName',
      getValue:      row => row.clusterName,
      sort:          ['clusterName']
    },
    NAMESPACE_COL,
    AGE
  ]);

  weightType(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES, 11, true);
  configureType(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES, {
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    canYaml:     true,
    customRoute: createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES })
  });
  headers(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES, [
    STATE,
    NAME_COL,
    {
      name:          'OsImagePath',
      labelKey:      'tableHeaders.imagePath',
      value:         'spec.osImage',
      getValue:      row => row.spec.osImage || '---',
      sort:          ['spec.osImage']
    },
    {
      name:          'OsVersion',
      labelKey:      'tableHeaders.osVersion',
      value:         'spec.managedOSVersionName',
      getValue:      row => row.spec.managedOSVersionName || '---',
      sort:          ['spec.managedOSVersionName']
    },
    {
      name:          'TargetClusters',
      labelKey:      'tableHeaders.targetClusters',
      value:         'clusterTargetsList',
      getValue:      row => row.clusterTargetsList || '---',
      sort:          ['clusterTargetsList']
    },
    AGE
  ]);

  weightType(ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR, 10, true);
  configureType(ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR, {
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    canYaml:     true,
    customRoute: createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR })
  });

  weightType(ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR_TEMPLATES, 9, true);
  configureType(ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR_TEMPLATES, {
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    canYaml:     true,
    customRoute: createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR_TEMPLATES })
  });

  // advanced tab
  weightType(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS, 8, true);
  configureType(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS, {
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    customRoute: createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS })
  });
  headers(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS, [
    STATE,
    NAME_COL,
    {
      name:          'OsVersionChannels',
      labelKey:      'tableHeaders.osVersionChannel',
      getValue:      row => row.metadata?.ownerReferences?.[0]?.name || '---',
      sort:          ['metadata.ownerReferences.[0].name']
    },
    AGE
  ]);

  weightType(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS, 7, true);
  configureType(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS, {
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    customRoute: createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS })
  });
  headers(ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS, [
    STATE,
    NAME_COL,
    {
      name:          'ChannelImage',
      labelKey:      'tableHeaders.channelImage',
      getValue:      row => row.spec?.options?.image || '---',
      sort:          ['spec.options.image']
    },
    AGE
  ]);

  basicType([
    ELEMENTAL_TYPES.DASHBOARD,
    ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
    ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES,
  ]);

  basicType([
    ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES,
    ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS,
    ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS,
  ], 'advanced');
}
