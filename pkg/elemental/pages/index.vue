<script>
import { allHash } from '@shell/utils/promise';
import Loading from '@shell/components/Loading';
import { CAPI } from '@shell/config/types';
import { NAME } from '@shell/config/table-headers';
import ResourceTable from '@shell/components/ResourceTable';
import PercentageBar from '@shell/components/PercentageBar';
import { ELEMENTAL_SCHEMA_IDS, ELEMENTAL_CLUSTER_PROVIDER } from '../config/elemental-types';
import { createElementalRoute } from '../utils/custom-routing';
import { filterForElementalClusters } from '../utils/elemental-utils';

const MAX_ITEMS_PER_TABLE = 6;

export default {
  name:       'Dashboard',
  components: {
    Loading, PercentageBar, ResourceTable
  },
  async fetch() {
    const allDispatches = await allHash({
      // needed for table
      machineRegistrations: this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }),
      // needed for resource gauge
      machineInventories:   this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES }),
      rancherClusters:      this.$store.dispatch('management/findAll', { type: CAPI.RANCHER_CLUSTER }),
      // needed for table
      managedOsImages:      this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }),
      // needed to populate cluster name col on machine inventories list
      machineInvSelector:   this.$store.dispatch(`management/findAll`, { type: ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR })
    });

    this.resourcesData = {};

    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS] = allDispatches.machineRegistrations;
    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES] = allDispatches.machineInventories;
    this.resourcesData[this.ELEMENTAL_CLUSTERS] = filterForElementalClusters(allDispatches.rancherClusters);
    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES] = allDispatches.managedOsImages;
    this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR] = allDispatches.machineInvSelector;
  },
  data() {
    return {
      ELEMENTAL_CLUSTERS:       'elementalClusters',
      machineInvCrd:            ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES,
      machineRegTitle:          this.t(`typeLabel."${ ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }"`, { count: 2 }),
      managedOsTitle:           this.t(`typeLabel."${ ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }"`, { count: 2 }),
      machineRegListLocation:   createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }),
      machineRegCreateLocation: createElementalRoute('resource-create', { resource: ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS }),
      managedOsListLocation:    createElementalRoute('resource', { resource: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }),
      managedOsCreateLocation:  createElementalRoute('resource-create', { resource: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES }),
      machineRegHeaders:        [
        NAME,
        {
          name:     'token',
          labelKey: 'tableHeaders.token',
          value:    'truncatedToken',
          getValue: row => row.truncatedToken,
          sort:     'truncatedToken'
        },
        {
          name:          'download',
          labelKey:      'tableHeaders.downloadTableDashboard',
          value:         this.t('tableHeaders.download')
        },
      ],
      managedOsHeaders:  [
        NAME,
        {
          name:     'osImage',
          labelKey: 'tableHeaders.osImage',
          value:    'spec.osImage',
          getValue: row => row.spec?.osImage,
          sort:     'spec.osImage'
        }
      ],
      colorStops: {
        0: '--success', 30: '--warning', 70: '--error'
      }
    };
  },
  computed: {
    cards() {
      const out = [];

      const clusterCreateRoute = {
        name:   'c-cluster-product-resource-create',
        params: {
          resource: CAPI.RANCHER_CLUSTER,
          product:  'manager',
        },
        query: { type: ELEMENTAL_CLUSTER_PROVIDER }
      };

      [
        ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS,
        ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES,
        this.ELEMENTAL_CLUSTERS
      ].forEach((type) => {
        const obj = {
          type,
          count:       this.resourcesData[type]?.length || 0,
          title:       this.t(`typeLabel."${ type }"`, { count: 2 }),
          btnLabel:    this.t(`elemental.dashboard.btnLabel.create."${ type }"`),
          btnRoute:    createElementalRoute(`resource-create`, { resource: type }),
          btnDisabled: false,
          btnVisible:  true
        };

        if (type === this.ELEMENTAL_CLUSTERS) {
          obj.btnRoute = clusterCreateRoute;
        }

        out.push(obj);
      });

      return out;
    },
    machineRegRows() {
      const data = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS];

      if (data.length > MAX_ITEMS_PER_TABLE) {
        return data.slice(0, MAX_ITEMS_PER_TABLE);
      }

      return data;
    },
    managedOsRows() {
      const data = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES];

      if (data.length > MAX_ITEMS_PER_TABLE) {
        return data.slice(0, MAX_ITEMS_PER_TABLE);
      }

      return data;
    },
    percentageBarValue() {
      const total = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES].length || 0;

      if (!this.used || !total) {
        return 0;
      }

      return (this.used * 100) / total;
    },
    free() {
      return this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES].length ? this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES].length - this.used : 0;
    },
    used() {
      const clusterAssignedInventories = this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES].filter(item => item.clusterName);

      return clusterAssignedInventories.length || 0;
    }
  },
  methods: {
    handleRoute(card) {
      if (!card.btnDisabled) {
        this.$router.replace(card.btnRoute);
      }
    },
    async downloadMachineReg(item) {
      await item.downloadMachineRegistration();
    }
  },
};
</script>

<template>
  <div>
    <Loading v-if="$fetchState.pending" />
    <div v-else>
      <h1 class="title">
        {{ t('elemental.menuLabels.titleDashboard') }}
      </h1>
      <!-- Top cards -->
      <div class="main-card-container">
        <div
          v-for="card, index in cards"
          :key="index"
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
              <p>Used<span>{{ used }}</span></p>
              <p>Free<span>{{ free }}</span></p>
            </div>
            <PercentageBar
              class="mt-10"
              :value="percentageBarValue"
              :color-stops="colorStops"
            />
          </div>
        </div>
      </div>
      <!-- Tables -->
      <div class="row mt-40 mb-40">
        <div class="col span-6">
          <div class="table-title-block">
            <h3 class="mb-20">
              {{ machineRegTitle }}
            </h3>
            <nuxt-link :to="machineRegListLocation">
              {{ t('elemental.dashboard.manageReg') }}
            </nuxt-link>
          </div>
          <div
            v-if="machineRegRows.length === 0"
            class="empty-table-state"
          >
            <p>{{ t('elemental.dashboard.noMachineReg') }}</p>
            <nuxt-link :to="machineRegCreateLocation">
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
            <template #col:download="{col, row}">
              <td>
                <a class="link" @click="downloadMachineReg(row)">
                  {{ col.value }}
                </a>
              </td>
            </template>
          </ResourceTable>
        </div>
        <div class="col span-6">
          <div class="table-title-block">
            <h3 class="mb-20">
              {{ managedOsTitle }}
            </h3>
            <nuxt-link :to="managedOsCreateLocation">
              {{ t('elemental.dashboard.manageOsImageUpgrade') }}
            </nuxt-link>
          </div>
          <div
            v-if="managedOsRows.length === 0"
            class="empty-table-state"
          >
            <p>{{ t('elemental.dashboard.noManageOs') }}</p>
            <nuxt-link :to="managedOsListLocation">
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
    margin: 0 10px;
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

      p {
        // font-size: 12px;
      }

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

.table-title-block {
  display: flex;
  justify-content: space-between;
}
</style>
