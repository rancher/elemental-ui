export const ELEMENTAL_PRODUCT_NAME = 'elemental';
export const ELEMENTAL_CLUSTER_PROVIDER = 'machineinventoryselectortemplate';

export const ELEMENTAL_SCHEMA_IDS = {
  MACHINE_INVENTORIES:            'elemental.cattle.io.machineinventory', // checked, all seems fine with the YAML EDITOR
  MACHINE_REGISTRATIONS:          'elemental.cattle.io.machineregistration', // checked, has some problems
  MANAGED_OS_IMAGES:              'elemental.cattle.io.managedosimage',
  MANAGED_OS_VERSION_CHANNELS:    'elemental.cattle.io.managedosversionchannel', // checked, all seems fine
  MANAGED_OS_VERSIONS:            'elemental.cattle.io.managedosversion', // only list view + VIEW YAML (seems to be all good)
  MACHINE_INV_SELECTOR:           'elemental.cattle.io.machineinventoryselector', // no UI for this
  MACHINE_INV_SELECTOR_TEMPLATES: 'elemental.cattle.io.machineinventoryselectortemplate', // no UI for this
  SEED_IMAGE:                     'elemental.cattle.io.seedimage', // checked, all seems fine with the YAML EDITOR
  METADATA:                       'elemental.cattle.io.metadata', // can't test 1.5.4 operator doesn't have it
};

export const KIND = { MACHINE_INV_SELECTOR_TEMPLATES: 'MachineInventorySelectorTemplate' };

export const ELEMENTAL_REPO = {
  REPO:   'https://github.com/rancher/elemental-operator',
  BRANCH: 'gh-pages'
};

export const ELEMENTAL_CHARTS = { OPERATOR: 'elemental' };

// BUILD MEDIA PAGE
// on MACHINE REG
// on DASHBOARD
// with new FEATURES (RAW BUILD)

// DASHBOARD PAGE
