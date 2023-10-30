export const ELEMENTAL_PRODUCT_NAME = 'elemental';
export const ELEMENTAL_CLUSTER_PROVIDER = 'machineinventoryselectortemplate';

export const ELEMENTAL_SCHEMA_IDS = {
  MACHINE_INVENTORIES:            'elemental.cattle.io.machineinventory',
  MACHINE_REGISTRATIONS:          'elemental.cattle.io.machineregistration',
  MANAGED_OS_IMAGES:              'elemental.cattle.io.managedosimage',
  MANAGED_OS_VERSION_CHANNELS:    'elemental.cattle.io.managedosversionchannel',
  MANAGED_OS_VERSIONS:            'elemental.cattle.io.managedosversion',
  MACHINE_INV_SELECTOR:           'elemental.cattle.io.machineinventoryselector',
  MACHINE_INV_SELECTOR_TEMPLATES: 'elemental.cattle.io.machineinventoryselectortemplate',
  SEED_IMAGE:                     'elemental.cattle.io.seedimage',
};

export const KIND = { MACHINE_INV_SELECTOR_TEMPLATES: 'MachineInventorySelectorTemplate' };

export const ELEMENTAL_REPO = {
  REPO:   'https://github.com/rancher/elemental-operator',
  BRANCH: 'gh-pages'
};

export const ELEMENTAL_CHARTS = {
  OPERATOR: 'elemental-operator',
  DEFAULTS: 'kubewarden-defaults',
};
