<script>
import { allHash } from '@shell/utils/promise';
import { CAPI, CATALOG } from '@shell/config/types';
import { _VIEW } from '@shell/config/query-params';
import { NAME } from '@shell/config/table-headers';
import ResourceTable from '@shell/components/ResourceTable';
import PercentageBar from '@shell/components/PercentageBar';
import { Banner } from '@components/Banner';
import {
  ELEMENTAL_SCHEMA_IDS,
  ELEMENTAL_CLUSTER_PROVIDER,
  KIND
} from '../config/elemental-types';
import { ELEMENTAL_TYPES } from '../types';
import { createElementalRoute } from '../utils/custom-routing';
import { filterForElementalClusters } from '../utils/elemental-utils';
import BuildMedia from './BuildMedia';

const MAX_ITEMS_PER_TABLE = 6;

export default {
  name:       'DashboardView',
  components: {
    Banner,
    PercentageBar,
    ResourceTable,
    BuildMedia,
  },
  async fetch() {
    const requests = {
      // needed for table
      machineRegistrations: this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }),
      // needed for resource gauge
      machineInventories:   this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES }),
      rancherClusters:      this.$store.dispatch('management/findAll', { type: CAPI.RANCHER_CLUSTER }),
      // needed for table
      managedOsImages:      this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }),
      // needed to populate cluster name col on machine inventories list
      machineInvSelector:   this.$store.dispatch(`management/findAll`, { type: ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR }),
      elementalSchema:      this.$store.getters['management/schemaFor'](ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES)
    };

    // needed to check if operator is installed
    if (this.$store.getters['management/canList'](CATALOG.APP)) {
      requests.installedApps = this.$store.dispatch('management/findAll', { type: CATALOG.APP });
    }

    const allDispatches = await allHash(requests);

    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS] = allDispatches.machineRegistrations;
    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES] = allDispatches.machineInventories;
    this.resourcesData[this.ELEMENTAL_CLUSTERS] = filterForElementalClusters(allDispatches.rancherClusters);
    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES] = allDispatches.managedOsImages;
    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR] = allDispatches.machineInvSelector;

    // we need to check for the length of the response
    // due to some issue with a standard-user, which can list apps
    // but the list comes up empty []
    const isElementalOperatorNotInstalledOnApps = allDispatches.installedApps && allDispatches.installedApps.length && !allDispatches.installedApps.find(item => item.id.includes('elemental-operator') && !item.id.includes('elemental-operator-crds'));

    // check if CRD is there but operator isn't
    if (allDispatches.elementalSchema && isElementalOperatorNotInstalledOnApps) {
      this.isElementalOpNotInstalledAndHasSchema = true;
    }
  },
  data() {
    return {
      ELEMENTAL_CLUSTERS:                    'elementalClusters',
      isElementalOpNotInstalledAndHasSchema: false,
      resource:                              ELEMENTAL_TYPES.DASHBOARD,
      mode:                                  _VIEW,
      resourcesData:                         {
        [`${ ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }`]: [],
        [`${ ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES }`]:   [],
        [`${ this.ELEMENTAL_CLUSTERS }`]:                    [],
        [`${ ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }`]:     [],
        [`${ ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR }`]:  [],
      },
      machineInvCrd:                         ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES,
      machineRegTitle:                       this.t(`typeLabel."${ ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }"`, { count: 2 }),
      managedOsTitle:                        this.t(`typeLabel."${ ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }"`, { count: 2 }),
      machineRegListLocation:                createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }),
      machineRegCreateLocation:              createElementalRoute('resource-create', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }),
      managedOsListLocation:                 createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }),
      managedOsCreateLocation:               createElementalRoute('resource-create', { resource: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }),
      machineRegHeaders:                     [
        NAME,
        {
          name:     'token',
          labelKey: 'tableHeaders.token',
          value:    'status.registrationToken',
          getValue: row => row.status?.registrationToken,
          sort:     'status.registrationToken'
        }
      ],
      managedOsHeaders:  [
        NAME,
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
      ],
      colorStops: {
        0: '--error', 20: '--warning', 75: '--info', 95: '--success'
      }
    };
  },
  computed: {
    cards() {
      const out = [];

      // create route
      const clusterCreateRoute = {
        name:   'c-cluster-product-resource-create',
        params: {
          resource: CAPI.RANCHER_CLUSTER,
          product:  'manager',
        },
        query: { type: ELEMENTAL_CLUSTER_PROVIDER }
      };

      // manage route
      const clusterManageRoute = {
        name:   'c-cluster-product-resource',
        params: {
          resource: CAPI.RANCHER_CLUSTER,
          product:  'manager',
        },
        query: { q: KIND.MACHINE_INV_SELECTOR_TEMPLATES }
      };

      // create cards objs
      [
        ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
        ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES,
        this.ELEMENTAL_CLUSTERS
      ].forEach((type) => {
        const obj = {
          type,
          count:       this.resourcesData[type]?.length || 0,
          title:       this.t(`typeLabel."${ type }"`, { count: 2 }),
          btnLabel:    this.t(`elemental.dashboard.btnLabel.${ this.resourcesData[type]?.length ? 'manage' : 'create' }."${ type }"`),
          btnRoute:    createElementalRoute(`resource${ !this.resourcesData[type]?.length ? '-create' : '' }`, { resource: type }),
          btnDisabled: false,
          btnVisible:  true
        };

        if (type === this.ELEMENTAL_CLUSTERS && obj.count > 0) {
          obj.btnRoute = clusterManageRoute;
        } else if (type === this.ELEMENTAL_CLUSTERS) {
          obj.btnRoute = clusterCreateRoute;
        }

        out.push(obj);
      });

      return out;
    },
    machineRegRows() {
      const data = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS];

      if (data?.length > MAX_ITEMS_PER_TABLE) {
        return data.slice(0, MAX_ITEMS_PER_TABLE);
      }

      return data || [];
    },
    managedOsRows() {
      const data = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES];

      if (data?.length > MAX_ITEMS_PER_TABLE) {
        return data.slice(0, MAX_ITEMS_PER_TABLE);
      }

      return data || [];
    },
    percentageBarValue() {
      const total = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES]?.length || 0;

      if (!this.used || !total) {
        return 0;
      }

      return (this.used * 100) / total;
    },
    free() {
      return this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES]?.length ? this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES]?.length - this.used : 0;
    },
    used() {
      const clusterAssignedInventories = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES].filter(item => item.clusterName);

      return clusterAssignedInventories?.length || 0;
    },
    registrationEndpoints() {
      return this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS] || [];
    }
  },
  methods: {
    handleRoute(card) {
      if (!card.btnDisabled) {
        this.$router.push(card.btnRoute);
      }
    },
    async downloadMachineReg(item, btnCb) {
      try {
        await item.downloadMachineRegistration();
        btnCb(true);
      } catch (e) {
        console.error('Failed to download file', e); // eslint-disable-line no-console

        btnCb(false);
      }
    },
    formatDataTestid(item) {
      try {
        return item.toLowerCase().replace(/\s/g, '-');
      } catch (error) {
        return 'name-not-generated';
      }
    }
  },
};
</script>

<template>
  <div>
    <Banner
      v-if="isElementalOpNotInstalledAndHasSchema"
      class="mb-20"
      color="warning"
      data-testid="warning-not-install-with-schema"
    >
      <div v-clean-html="t('product.notInstalledHasSchema', {}, true)" />
    </Banner>
    <h1 class="title" data-testid="elemental-main-title">
      {{ t('elemental.menuLabels.titleDashboard') }}
    </h1>
    <!-- Top cards -->
    <div class="main-card-container">
      <div
        v-for="card, index in cards"
        :key="index"
        :data-testid="`card-${formatDataTestid(card.title)}`"
        class="card"
      >
        <div class="card-top-block">
          <h1>{{ card.count }}</h1>
          <p>{{ card.title }}</p>
        </div>
        <button
          v-if="card.type !== machineInvCrd || (card.type === machineInvCrd && !card.count)"
          type="button"
          class="btn role-secondary"
          :data-testid="`button-${formatDataTestid(card.btnLabel)}`"
          :class="{disabled: card.btnDisabled}"
          @click="handleRoute(card)"
        >
          {{ card.btnLabel }}
        </button>
        <div
          v-else
          class="used-percentage-container mt-10"
        >
          <div>
            <p>{{ t('elemental.dashboard.used') }}<span>{{ used }}</span></p>
            <p>{{ t('elemental.dashboard.free') }}<span>{{ free }}</span></p>
          </div>
          <PercentageBar
            class="mt-10"
            :value="percentageBarValue"
            :color-stops="colorStops"
          />
        </div>
      </div>
    </div>
    <!-- Build ISO interface -->
    <div class="mt-20 mb-20">
      <BuildMedia
        :registration-endpoint-list="registrationEndpoints"
        :resource="resource"
        :mode="mode"
      />
    </div>
    <!-- Tables -->
    <div class="main-tables-container mb-40 mt-40">
      <div
        class="table-list"
        data-testid="machine-reg-block"
      >
        <div class="table-title-block">
          <h3 class="mb-20">
            {{ machineRegTitle }}
          </h3>
          <nuxt-link
            :to="machineRegListLocation"
            class="table-title-block-link"
            data-testid="manage-reg-btn"
          >
            {{ t('elemental.dashboard.manageReg') }}
          </nuxt-link>
        </div>
        <div
          v-if="machineRegRows?.length === 0"
          class="empty-table-state"
        >
          <p>{{ t('elemental.dashboard.noMachineReg') }}</p>
          <nuxt-link
            :to="machineRegCreateLocation"
            data-testid="create-machine-reg-btn"
          >
            {{ t('elemental.dashboard.noMachineRegAction') }}
          </nuxt-link>
        </div>
        <ResourceTable
          v-else
          :rows="machineRegRows"
          :headers="machineRegHeaders"
          :search="false"
          :table-actions="false"
          :row-actions="true"
          key-field="key"
        >
          <template #col:token="{row}">
            <td class="token-truncate">
              {{ row.status.registrationToken }}
            </td>
          </template>
        </ResourceTable>
      </div>
      <div
        class="table-list"
        data-testid="update-group-block"
      >
        <div class="table-title-block">
          <h3 class="mb-20">
            {{ managedOsTitle }}
          </h3>
          <nuxt-link
            :to="managedOsListLocation"
            class="table-title-block-link"
            data-testid="manage-update-group-btn"
          >
            {{ t('elemental.dashboard.manageOsImageUpgrade') }}
          </nuxt-link>
        </div>
        <div
          v-if="managedOsRows?.length === 0"
          class="empty-table-state"
        >
          <p>{{ t('elemental.dashboard.noManageOs') }}</p>
          <nuxt-link
            :to="managedOsCreateLocation"
            data-testid="create-update-group-btn"
          >
            {{ t('elemental.dashboard.noManageOsAction') }}
          </nuxt-link>
        </div>
        <ResourceTable
          v-else
          :rows="managedOsRows"
          :headers="managedOsHeaders"
          :search="false"
          :table-actions="false"
          :row-actions="true"
          key-field="key"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  margin: 20px 0 20px 0;
}

.main-card-container {
  display: flex;
  flex-wrap: wrap;

  .card {
    width: fit-content;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    border: 1px solid var(--border);
    margin: 0 10px 20px 10px;
    padding: 20px;
    height: 141px;

    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }

    .card-top-block {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        margin: 0 15px 0 0;
        font-weight: bold;
      }

      p {
        font-size: 18px;
        font-weight: bold;
      }
    }

    button {
      justify-content: center;
      width: fit-content;
      font-weight: bold;
      margin-top: 12px;
    }
  }

  .used-percentage-container {
    > div {
      display: flex;
      justify-content: space-between;

      span {
        font-size: 12px;
        padding-left: 10px;
        color: var(--muted);
      }
    }
  }
}

.link {
  cursor: pointer;
}

.empty-table-state {
  border: 1px solid var(--border);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 0;

  p {
    margin-bottom: 20px;
  }
}

.main-tables-container {
  display: flex;
  .table-list {
    width: 50%;

    &:first-child {
      margin-right: 10px;
    }
    &:last-child {
      margin-left: 10px;
    }

    .table-title-block {
      display: flex;
      justify-content: space-between;
    }
    .table-title-block-link {
      margin-top: 2px;
    }

    .token-truncate {
      max-width: 180px;
      width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

::v-deep .main-tables-container {
 .download-machine-reg {
    display: flex;
    justify-content: center;
    height: 59px;
    min-width: 130px;

    .icon.icon-lg {
      display: none;
    }
  }
}

@media screen and (max-width: 1080px) {
  .main-tables-container {
    flex-direction: column;

    .table-list {
      width: 100%;
      margin: 0 0 20px 0 !important;
    }
  }

  .main-card-container .card {
    &:nth-child(2) {
      margin: 0 0 20px 10px;
    }
    &:last-child {
      width: 100%;
      margin: 0 0 20px 0;
    }
  }
}

@media screen and (max-width: 800px) {
  .main-card-container .card {
    &:first-child, &:nth-child(2) {
      width: 100%;
      margin: 0 0 20px 0;
    }
  }
}
</style>
