<script>
import { mapGetters } from 'vuex';
import { allHash } from '@shell/utils/promise';

import { CATALOG, MANAGEMENT } from '@shell/config/types';
import { REPO_TYPE, REPO, CHART, VERSION } from '@shell/config/query-params';

import Loading from '@shell/components/Loading';
import { Banner } from '@components/Banner';
import CopyCode from '@shell/components/CopyCode';
import AsyncButton from '@shell/components/AsyncButton';

import ElementalOpNotInstalled from '../components/ElementalOpNotInstalled';
import InstallView from '../components/InstallView';
import DashboardView from '../components/DashboardView';

import { ELEMENTAL_SCHEMA_IDS, ELEMENTAL_REPO, ELEMENTAL_CHARTS } from '../config/elemental-types';
import { handleGrowl, getLatestStableVersion } from '../utils/elemental-utils';

export default {
  name:       'BaseView',
  components: {
    Loading,
    ElementalOpNotInstalled,
    InstallView,
    DashboardView,
    CopyCode,
    AsyncButton,
    Banner
  },
  async fetch() {
    // this covers scenario where Elemental Operator is deleted from Apps and we lose the Elemental Admin role for Standard Users...
    if (this.$store.getters['management/canList'](ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS)) {
      const requests = { elementalSchema: this.$store.getters['management/schemaFor'](ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES) };

      // needed to check if operator is installed
      if (this.$store.getters['management/canList'](CATALOG.APP)) {
        requests.installedApps = this.$store.dispatch('management/findAll', { type: CATALOG.APP });
      }
      // get repos installer
      if (this.$store.getters['management/canList'](CATALOG.CLUSTER_REPO)) {
        requests.installedRepos = this.$store.dispatch('management/findAll', { type: CATALOG.CLUSTER_REPO });
      }

      const allDispatches = await allHash(requests);

      console.log('allDispatches', allDispatches);

      // get local cluster for opening kubectl shell
      const clusters = this.$store.getters['management/all'](MANAGEMENT.CLUSTER);
      const localCluster = clusters.find(c => c.nameDisplay === 'local');

      if (localCluster) {
        this.localCluster = localCluster;
      }

      // force the refresh of the catalog to populate the charts
      if ( !this.elementalRepo || !this.operatorChart ) {
        await this.$store.dispatch('catalog/refresh');
      }

      // we need to check for the length of the response
      // due to some issue with a standard-user, which can list apps
      // but the list comes up empty []
      const isElementalOperatorNotInstalledOnApps = allDispatches.installedApps?.length && !allDispatches.installedApps.find(item => item.id.includes('elemental-operator'));

      // check if operator is installed
      if (!allDispatches.elementalSchema || isElementalOperatorNotInstalledOnApps) {
        this.isElementalOpInstalled = false;
      }
    } else {
      this.isElementalOpInstalled = false;
    }
  },
  data() {
    return {
      isElementalOpInstalled: true,
      localCluster:           undefined,
      initStepIndex:          0,
      installSteps:           [
        {
          name:        'crds',
          label:       'Elemental CRDs',
          ready:       false,
        },
        {
          name:  'operator',
          label: 'Elemental Operator',
          ready: false,
        },
      ]
    };
  },
  watch: {
    crds() {
      this.installSteps[0].ready = true;

      // this.$children.$refs.wizard?.goToStep(2);
    }
  },
  computed: {
    ...mapGetters({
      charts: 'catalog/charts', repos: 'catalog/repos', t: 'i18n/t'
    }),

    operatorChart() {
      if ( this.elementalRepo ) {
        return this.$store.getters['catalog/chart']({
          repoName:  this.elementalRepo.id,
          repoType:  'cluster',
          chartName: ELEMENTAL_CHARTS.OPERATOR
        });
      }

      return null;
    },

    elementalRepo() {
      console.log('this.charts', this.charts?.find(c => c.chartName.includes('elemental')));
      const chart = this.charts?.find(chart => chart.chartName === ELEMENTAL_CHARTS.OPERATOR);

      console.log('chart', chart);
      console.log('this.repos', this.repos);

      return this.repos?.find(repo => repo.id === chart?.repoName);
    },

    // not needed
    crds() {
      return this.$store.getters['management/all'](CATALOG.APP).find(s => s.metadata?.name === 'elemental-operator-crds');
    },

    // not needed
    operator() {
      return this.$store.getters['management/all'](CATALOG.APP).find(s => s.metadata?.name === 'elemental-operator');
    },

    // not needed
    shellEnabled() {
      if (this.localCluster && this.localCluster?.links?.shell) {
        return !!this.localCluster?.links?.shell;
      }

      return false;
    },
  },
  methods: {
    async addRepository(btnCb) {
      try {
        const repoObj = await this.$store.dispatch('cluster/create', {
          type:     CATALOG.CLUSTER_REPO,
          metadata: { name: 'elemental-operator-charts' },
          spec:     {
            gitBranch: ELEMENTAL_REPO.BRANCH,
            gitRepo:   ELEMENTAL_REPO.REPO
          },
        });

        try {
          await repoObj.save();
        } catch (e) {
          handleGrowl({ error: e, store: this.$store });
          btnCb(false);

          return;
        }

        await this.refreshCharts();
        btnCb(true);
      } catch (e) {
        handleGrowl({ error: e, store: this.$store });
        btnCb(false);
      }
    },

    async refreshCharts(retry = 0, init) {
      try {
        await this.$store.dispatch('catalog/refresh');
      } catch (e) {
        handleGrowl({ error: e, store: this.$store });
      }

      if ( !this.operatorChart && retry === 0 ) {
        await this.$store.dispatch('management/findAll', { type: CATALOG.CLUSTER_REPO });
        await this.refreshCharts(retry + 1);
      }

      if ( !this.operatorChart && retry === 1 && !init ) {
        this.reloadReady = true;
      }
    },

    async chartRoute() {
      if ( !this.operatorChart ) {
        try {
          await this.refreshCharts();
        } catch (e) {
          handleGrowl({ error: e, store: this.$store });

          return;
        }
      }

      const {
        repoType, repoName, chartName, versions
      } = this.operatorChart;
      const latestStableVersion = getLatestStableVersion(versions);

      if ( latestStableVersion ) {
        const query = {
          [REPO_TYPE]: repoType,
          [REPO]:      repoName,
          [CHART]:     chartName,
          [VERSION]:   latestStableVersion.version
        };

        this.$router.push({
          name:   'c-cluster-apps-charts-install',
          params: { cluster: '_' },
          query,
        });
      } else {
        const error = {
          _statusText: this.t('extensions.installScreen.versionError.title'),
          message:     this.t('extensions.installScreen.versionError.message')
        };

        handleGrowl({ error, store: this.$store });
      }
    },

    reload() {
      this.$router.go();
    }
  },
};
</script>

<template>
  <div>
    <Loading v-if="$fetchState.pending" />
    <!-- Elemental Operator not installed -->
    <InstallView
      v-else
      :product-name="t('product.elemental')"
      :init-step-index="initStepIndex"
      :install-steps="installSteps"
      :wizard-title="t('extensions.installScreen.stepTitle')"
      :wizard-sub-title="t('extensions.installScreen.stepSubtitle')"
    >
      <!-- elemental icon -->
      <template #extension-icon>
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
      </template>

      <template #crds>
        <template v-if="!elementalRepo">
          <h2
            class="mt-20 mb-10"
            data-testid="kw-repo-title"
          >
            {{ t("extensions.installScreen.repo.title") }}
          </h2>
          <p class="mb-20">
            {{ t("extensions.installScreen.repo.description") }}
          </p>

          <AsyncButton
            mode="elementalRepo"
            data-testid="kw-repo-add-button"
            @click="addRepository"
          />
        </template>

        <template v-else>
          <h2 class="mt-20 mb-10" data-testid="kw-app-install-title">
            {{ t("extensions.installScreen.crds.title") }}
          </h2>
          <p class="mb-20">
            {{ t("extensions.installScreen.crds.description") }}
          </p>

          <div class="chart-route">
            <Loading v-if="!operatorChart && !reloadReady" mode="relative" class="mt-20" />

            <template v-else-if="!operatorChart && reloadReady">
              <Banner color="warning">
                <span class="mb-20">
                  {{ t('extensions.installScreen.crds.reload' ) }}
                </span>
                <button class="ml-10 btn btn-sm role-primary" @click="reload()">
                  {{ t('generic.reload') }}
                </button>
              </Banner>
            </template>

            <template v-else>
              <button
                data-testid="kw-app-install-button"
                class="btn role-primary mt-20"
                :disabled="!operatorChart"
                @click.prevent="chartRoute"
              >
                {{ t("extensions.installScreen.crds.button") }}
              </button>
            </template>
          </div>
        </template>
      </template>

      <!-- <template #crds>
        <h2
          class="mt-20 mb-10"
          data-testid="kw-cm-title"
        >
          {{ t("extensions.installScreen.crds.title") }}
        </h2>
        <p class="mb-20">
          {{ t("extensions.installScreen.crds.description") }}
        </p>

        <p v-clean-html="t('extensions.installScreen.crds.manualStep', null, true)"></p>
        <CopyCode class="m-10 p-10" data-testid="kw-cm-copy-code">
          {{ t("extensions.installScreen.crds.applyCommand") }}
        </CopyCode>
        <button
          data-testid="kw-cm-open-shell"
          :disabled="!shellEnabled"
          type="button"
          class="btn role-secondary"
          @shortkey="localCluster.openShell()"
          @click="localCluster.openShell()"
        >
          <i class="icon icon-terminal icon-lg" />{{ t("extensions.installScreen.crds.openShell") }}
        </button>

        <slot>
          <Banner
            class="mb-20 mt-40"
            color="info"
            :label="t('extensions.installScreen.crds.stepProgress')"
          />
        </slot>
      </template> -->
    </InstallView>
    <!-- <ElementalOpNotInstalled
      v-else-if="!isElementalOpInstalled"
    /> -->
    <!-- Dashboard view -->
    <!-- <DashboardView v-else /> -->
  </div>
</template>

<style lang="scss" scoped>
</style>
