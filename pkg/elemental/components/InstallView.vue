<script>
import { Banner } from '@components/Banner';
import Loading from '@shell/components/Loading';
import Markdown from '@shell/components/Markdown';
import InstallWizard from './InstallWizard';

export default {
  props: {
    hasSchema: {
      type:     Object,
      default:  null
    },

    productName: {
      type:     String,
      default:  ''
    },

    initStepIndex: {
      type:     Number,
      default:  0
    },

    installSteps: {
      type:     Array,
      default:  () => []
    },

    wizardTitle: {
      type:     String,
      default:  ''
    },

    wizardSubTitle: {
      type:     String,
      default:  ''
    }
  },

  components: {
    Banner,
    InstallWizard,
    Loading,
    Markdown
  },

  async fetch() {
  },

  data() {
    return {
      install:       false,
      docs:          { airgap: '' }
    };
  },

  // TO FIX!!! - airgap
  mounted() {
    // this.$emit('wizard-step-control', this.$refs.wizard);
    // if ( this.isAirgap ) {
    //   const docs = (await import(/* webpackChunkName: "airgap-docs" */ '../../assets/airgap-installation.md'));

    //   if ( docs ) {
    //     this.docs.airgap = docs.body;
    //   }
    // }
  },

  watch: {
    // $refs: {
    //   handler(neu) {
    //     console.log('neu', neu);
    //     if (this.$refs) {
    //       this.$emit('wizard-step-control', this.$refs.wizard);
    //     }
    //   },
    //   immediate: true
    // }
    // async certService() {
    //   this.installSteps[0].ready = true;

    //   if ( this.isAirgap ) {
    //     await this.refreshCharts();
    //   }

    //   this.$refs.wizard?.goToStep(2);
    // }
  },

  computed: {
    // TO FIX!!! - airgap
    isAirgap() {
      // return this.$store.getters['kubewarden/airGapped'];
      return false;
    },
  },

  methods: {}
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else class="container">
    <!-- Splash screen -->
    <div
      v-if="!install"
      class="title p-10"
    >
      <div class="logo mt-20 mb-10">
        <slot name="extension-icon"></slot>
      </div>
      <h1
        class="mb-20"
        data-testid="kw-install-title"
      >
        {{ t("extensions.splashScreen.title") }}
      </h1>
      <div
        v-clean-html="t('extensions.splashScreen.description', {}, true)"
        class="description"
      >
      </div>
      <button
        v-if="!hasSchema"
        class="btn role-primary mt-20"
        data-testid="kw-initial-install-button"
        @click="install = true"
      >
        {{ t("extensions.splashScreen.button", { product: productName }) }}
      </button>
    </div>

    <template v-else>
      <!-- Air-Gapped - NOT TACKLED YET!!! -->
      <template v-if="isAirgap">
        <Banner
          class="mb-20 mt-20"
          color="warning"
        >
          <span data-testid="kw-install-ag-warning">{{ t('kubewarden.dashboard.prerequisites.airGapped.warning') }}</span>
        </Banner>
        <Markdown v-model="docs.airgap" />
      </template>

      <!-- Non Air-Gapped -->
      <template v-else>
        <InstallWizard
          ref="wizard"
          :init-step-index="initStepIndex"
          :steps="installSteps"
          :wizard-title="wizardTitle"
          :wizard-sub-title="wizardSubTitle"
        >
          <template
            v-for="(_, slot) of $scopedSlots"
            v-slot:[slot]="scope"
          >
            <slot
              :name="slot"
              v-bind="scope"
            />
          </template>
        </InstallWizard>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.container {
  & .title {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 100px 0;
  }

  & .description {
    line-height: 20px;
  }

  & .chart-route {
    position: relative;
  }

  & .airgap-align {
    justify-content: start;
  }
}
</style>
