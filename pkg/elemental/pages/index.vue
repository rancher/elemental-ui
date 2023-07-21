<script>
import { allHash } from '@shell/utils/promise';
import Loading from '@shell/components/Loading';
import { CAPI, CATALOG } from '@shell/config/types';
import { NAME } from '@shell/config/table-headers';
import ResourceTable from '@shell/components/ResourceTable';
import PercentageBar from '@shell/components/PercentageBar';
import { Banner } from '@components/Banner';
import {
  ELEMENTAL_SCHEMA_IDS,
  ELEMENTAL_CLUSTER_PROVIDER,
  KIND
} from '../config/elemental-types';
import { createElementalRoute } from '../utils/custom-routing';
import { filterForElementalClusters } from '../utils/elemental-utils';
import BuildIso from '../components/BuildIso';

const MAX_ITEMS_PER_TABLE = 6;

export default {
  name:       'Dashboard',
  components: {
    Loading, Banner, PercentageBar, ResourceTable, BuildIso
  },
  async fetch() {
    // this covers scenario where Elemental Operator is deleted from Apps and we lose the Elemental Admin role for Standard Users...
    if (this.$store.getters['management/canList'](ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS)) {
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

      this.resourcesData = {};

      this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS] = allDispatches.machineRegistrations;
      this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES] = allDispatches.machineInventories;
      this.resourcesData[this.ELEMENTAL_CLUSTERS] = filterForElementalClusters(allDispatches.rancherClusters);
      this.resourcesData[ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES] = allDispatches.managedOsImages;
      this.resourcesData[ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR] = allDispatches.machineInvSelector;

      // we need to check for the length of the response
      // due to some issue with a standard-user, which can list apps
      // but the list comes up empty []
      const isElementalOperatorNotInstalledOnApps = allDispatches.installedApps && allDispatches.installedApps.length && !allDispatches.installedApps.find(item => item.id.includes('elemental-operator'));

      // check if operator is installed
      if (!allDispatches.elementalSchema || isElementalOperatorNotInstalledOnApps) {
        this.isElementalOpInstalled = false;
      }
      // check if CRD is there but operator isn't
      if (allDispatches.elementalSchema && isElementalOperatorNotInstalledOnApps) {
        this.isElementalOpNotInstalledAndHasSchema = true;
      }
    } else {
      this.isElementalOpInstalled = false;
    }
  },
  data() {
    return {
      isElementalOpInstalled:                true,
      isElementalOpNotInstalledAndHasSchema: false,
      ELEMENTAL_CLUSTERS:                    'elementalClusters',
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

      const clusterCreateRoute = {
        name:   'c-cluster-product-resource-create',
        params: {
          resource: CAPI.RANCHER_CLUSTER,
          product:  'manager',
        },
        query: { type: ELEMENTAL_CLUSTER_PROVIDER }
      };

      const clusterManageRoute = {
        name:   'c-cluster-product-resource',
        params: {
          resource: CAPI.RANCHER_CLUSTER,
          product:  'manager',
        },
        query: { q: KIND.MACHINE_INV_SELECTOR_TEMPLATES }
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
    },
    registrationEndpoints() {
      return this.resourcesData?.[ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS] || [];
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
    <Loading v-if="$fetchState.pending" />
    <!-- Elemental Operator not installed -->
    <div
      v-else-if="!isElementalOpInstalled"
      class="not-installed p-10"
    >
      <div class="elemental-logo mt-20 mb-10">
        <svg
          width="32"
          height="32"
          version="1.1"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:cc="http://creativecommons.org/ns#"
          xmlns:dc="http://purl.org/dc/elements/1.1/"
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          data-testid="elemental-icon"
        >
          <path d="m19.815 1.7301c-2.58 2.1868-5.2054 4.4095-7.1117 7.2308-1.5421-0.68689-2.4041-1.4374-3.9591-2.2561 0.10575 2.5182-1.0485 8.1467-1.0485 8.1467s-2.7364-1.1426-3.4544-1.7499c-1.5094 7.5704 1.5423 14.516 4.2174 15.512-2.4346-4.0904-1.9532-8.383-2.2783-11.922 0.70834 0.19817 3.2167 1.3552 3.2167 1.3552s1.5349-5.2704 1.7657-7.1474c0.35588-0.17673 2.2587 1.5699 2.2587 1.5699s4.4942-6.3785 4.9654-5.855c0.24957 3.0538 2.4639 5.9451 2.7831 8.7771 1.1229-0.43788 2.251-1.099 3.3739-1.5369 1.2859 2.0276 1.593 4.6848 0.87919 15.125 1.7074-3.9645 2.4989-7.1695 2.7194-10.871 0.15218-2.5549-0.68846-5.5109-1.2476-8.0962-1.0528 0.41053-2.6801 0.992-3.7329 1.4026-1.3899-3.5546-2.8209-6.3417-3.3472-9.6853z" stroke-width="1.1688" />
          <path d="m16.166 12.71s-0.30557 1.4187-1.0714 2.7058c-1.5366 2.5826-1.9658 3.1325-2.7518 4.6113-0.91122 1.7142-2.0904 3.5459-1.7735 5.4203 0.29322 1.7348 1.575 3.5224 3.1994 4.1986 2.3952 0.99716 5.9631 0.89724 7.7171-1.0146 1.4273-1.5558 1.5035-4.605 0.2828-6.3275-0.93748-1.323-2.0922-3.0908-3.0321-4.7013-0.92852-1.5911-2.5703-4.8926-2.5703-4.8926zm-2.6097 11.247c0.32254 0.9525 0.60977 1.4545 1.168 1.9787 0.69835 0.65574 1.3022 1.036 2.5617 1.3025l-0.04756 1.4089c-0.84539-0.09897-2.7005-0.3863-3.6463-1.257-0.884-0.8138-1.4935-2.0246-1.4519-3.2991z" stroke-width="1.1688" />
        </svg>
      </div>
      <h1 class="mb-20">
        {{ t("product.elemental") }}
      </h1>
      <p
        class="description"
        data-testid="elemental-description-text"
        v-html="t('product.description', {}, true)"
      />
      <Banner
        class="mt-40"
        color="warning"
        data-testid="warning-not-install-or-no-schema"
        v-html="t('product.notInstalledOrNoSchema', {}, true)"
      />
    </div>
    <div v-else>
      <Banner
        v-if="isElementalOpNotInstalledAndHasSchema"
        class="mb-20"
        color="warning"
        data-testid="warning-not-install-with-schema"
        v-html="t('product.notInstalledHasSchema', {}, true)"
      />
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
        <BuildIso
          :registration-endpoint-list="registrationEndpoints"
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
            v-if="machineRegRows.length === 0"
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
            v-if="managedOsRows.length === 0"
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
  </div>
</template>

<style lang="scss">
body.theme-dark .elemental-logo svg {
  fill: #FFFFFF;
}
</style>

<style lang="scss" scoped>
.not-installed {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 100px 0;

  .elemental-logo svg {
    transform: scale(1.5);
  }

  .description {
    line-height: 20px;
  }
}

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
