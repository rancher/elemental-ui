<script>
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { Banner } from '@components/Banner';
import AsyncButton from '@shell/components/AsyncButton';
import { randomStr, CHARSET } from '@shell/utils/string';
import { ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';

export default {
  name:       'BuildIso',
  components: {
    LabeledSelect,
    Banner,
    AsyncButton
  },
  props: {
    displayRegEndpoints: {
      type:    Boolean,
      default: true
    },
    registrationEndpointList: {
      type:    Array,
      default: () => []
    },
    registrationEndpoint: {
      type:    String,
      default: ''
    }
  },
  async fetch() {
    this.seedImagesList = await this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.SEED_IMAGE });
    const managedOsVersions = await this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS });

    this.filteredManagedOsVersions = managedOsVersions.filter(v => v.spec?.type === 'iso') || [];

    if (this.filteredManagedOsVersions.length) {
      this.buildIsoOsVersionSelected = this.filteredManagedOsVersions[0].spec?.metadata?.uri;
    }
  },
  data() {
    return {
      seedImagesList:                [],
      filteredManagedOsVersions:     [],
      buildIsoOsVersionSelected:     '',
      registrationEndpointSelected:  '',
      isoBuildTriggerError:          '',
      seedImage:                     undefined,
      buildBtnCallback:              undefined
    };
  },
  computed: {
    buildIsoOsVersions() {
      return this.filteredManagedOsVersions.map((f) => {
        return {
          label: f.spec?.metadata?.displayName,
          value: f.spec?.metadata?.uri,
        };
      });
    },
    registrationEndpointsOptions() {
      const activeRegEndpoints = this.registrationEndpointList.filter(item => item.state === 'active');

      return activeRegEndpoints.map((machReg) => {
        return {
          label: machReg.name,
          value: `${ machReg.namespace }/${ machReg.name }`
        };
      });
    },
    isBuildIsoBtnEnabled() {
      return this.displayRegEndpoints ? !!(this.buildIsoOsVersionSelected && this.registrationEndpointSelected) : !!this.buildIsoOsVersionSelected;
    },
    seedImageFound() {
      console.log('this.seedImagesList', this.seedImagesList);
      if (this.machineRegName && this.selectedBuildIsoValidLabel) {
        const imgFound = this.seedImagesList.find(s => s.metadata?.name === `iso-image-reg-${ this.machineRegName }-${ this.selectedBuildIsoValidLabel }`);

        if (imgFound) {
          return imgFound;
        }
      }

      return {};
    },
    isIsoBuilt() {
      console.log('isIsoBuilt seedImageFound', this.seedImageFound);
      if (this.seedImageFound && this.seedImageFound.status?.downloadURL) {
        if (this.buildBtnCallback) {
          this.buildBtnCallback(true);
        }

        return true;
      }

      return false;
    },
    isoBuildProcessError() {
      if (this.seedImageFound && this.seedImageFound.status?.conditions) {
        let errorFound = '';
        const excludedReasons = ['SeedImageBuildSuccess', 'ResourcesSuccessfullyCreated', 'SeedImageBuildOngoing'];

        for (let i = 0; i < this.seedImageFound.status?.conditions.length; i++) {
          const condition = this.seedImageFound.status?.conditions[i];

          if (condition.status === 'False' && !excludedReasons.includes(condition.reason)) {
            if (this.buildBtnCallback) {
              this.buildBtnCallback(false);
            }

            errorFound = condition.message;
            break;
          }
        }

        if (errorFound) {
          return errorFound;
        }
      }

      return '';
    },
    isoBuildProcessOngoing() {
      let isoBuildProcessOngoing = false;

      console.log('isoBuildProcessOngoing', this.seedImageFound?.id);

      if (this.seedImageFound && this.seedImageFound.status?.conditions) {
        for (let i = 0; i < this.seedImageFound.status?.conditions.length; i++) {
          const condition = this.seedImageFound.status?.conditions[i];

          if (condition.status === 'False' && condition.reason === 'SeedImageBuildOngoing') {
            isoBuildProcessOngoing = true;
            break;
          }
        }
      }

      return isoBuildProcessOngoing;
    },
    machineRegName() {
      if (this.isBuildIsoBtnEnabled) {
        return this.displayRegEndpoints ? this.registrationEndpointSelected.split('/')[1] : this.registrationEndpoint.split('/')[1];
      }

      return '';
    },
    machineRegNamespace() {
      if (this.isBuildIsoBtnEnabled) {
        return this.displayRegEndpoints ? this.registrationEndpointSelected.split('/')[0] : this.registrationEndpoint.split('/')[0];
      }

      return '';
    },
    selectedBuildIsoValidLabel() {
      if (this.buildIsoOsVersionSelected) {
        const isoVersion = this.buildIsoOsVersions.find(v => v.value === this.buildIsoOsVersionSelected);

        if (isoVersion && isoVersion.label?.length) {
          const stripSpecialChars = isoVersion.label.replace(/[^a-zA-Z0-9 ]/g, '');

          return stripSpecialChars?.toLowerCase()?.replace(/\s+/g, '-') || '';
        }
      }

      return '';
    },
    disableBuildIsoBtn() {
      console.log('this.isBuildIsoBtnEnabled', this.isBuildIsoBtnEnabled);
      console.log('this.isIsoBuilt', this.isIsoBuilt);
      console.log('this.isoBuildProcessOngoing', this.isoBuildProcessOngoing);
      if (!this.isBuildIsoBtnEnabled || this.isIsoBuilt || (!this.isIsoBuilt && this.isoBuildProcessOngoing)) {
        return true;
      }

      return false;
    },
    disableRebuildIsoBtn() {
      if (!this.isBuildIsoBtnEnabled || !(this.isIsoBuilt || (!this.isIsoBuilt && this.isoBuildProcessOngoing))) {
        return true;
      }

      return false;
    }
  },
  methods: {
    async rebuildIso(btnCb) {
      this.isoBuildTriggerError = '';

      // flag to re-trigger build process
      this.seedImageFound.spec.retriggerBuild = true;

      try {
        await this.seedImageFound.save();
        this.buildBtnCallback = btnCb;
      } catch (e) {
        this.isoBuildTriggerError = e;
        btnCb(false);
      }
    },
    async buildIso(btnCb) {
      this.isoBuildTriggerError = '';

      const seedImageModel = await this.$store.dispatch('management/create', {
        metadata: {
          name:      `iso-image-reg-${ this.machineRegName }-${ this.selectedBuildIsoValidLabel }`,
          namespace: 'fleet-default'
        },
        spec: {
          baseImage:       this.buildIsoOsVersionSelected,
          registrationRef: {
            name:      this.machineRegName,
            namespace: this.machineRegNamespace
          }
        },
        type: ELEMENTAL_SCHEMA_IDS.SEED_IMAGE,
      });

      try {
        await seedImageModel.save({ url: `/v1/${ ELEMENTAL_SCHEMA_IDS.SEED_IMAGE }`, method: 'POST' });
        this.buildBtnCallback = btnCb;
      } catch (e) {
        this.isoBuildTriggerError = e;
        btnCb(false);
      }
    },
    downloadIso(ev) {
      ev.preventDefault();

      if (this.isIsoBuilt) {
        const downloadUrl = this.seedImageFound?.status?.downloadURL;
        const link = document.createElement('a');

        link.download = 'elemental.iso';
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },
};
</script>

<template>
  <div>
    <h3 class="build-iso-title">
      {{ t('elemental.machineRegistration.edit.buildIsoTitle') }}
    </h3>
    <div class="row mb-10">
      <div
        v-if="displayRegEndpoints"
        class="col span-3"
      >
        <LabeledSelect
          v-model="registrationEndpointSelected"
          class="mr-20"
          data-testid="select-registration-endpoint-build-iso"
          :label="t('elemental.machineRegistration.create.machineReg')"
          :placeholder="t('elemental.dashboard.regEndpointPlaceholder')"
          :options="registrationEndpointsOptions"
        />
      </div>
      <div class="col span-3">
        <LabeledSelect
          v-model="buildIsoOsVersionSelected"
          class="mr-20"
          data-testid="select-os-version-build-iso"
          :label="t('elemental.machineRegistration.edit.osVersion')"
          :placeholder="t('elemental.machineRegistration.edit.osVersionPlaceholder')"
          :options="buildIsoOsVersions"
        />
      </div>
      <div class="col mt-10 span-5 flex">
        <AsyncButton
          mode="buildIso"
          class="mr-20"
          data-testid="build-iso-btn"
          :disabled="disableBuildIsoBtn"
          @click="buildIso"
        />
        <AsyncButton
          mode="rebuildIso"
          class="mr-20"
          data-testid="rebuild-iso-btn"
          :disabled="disableRebuildIsoBtn"
          @click="rebuildIso"
        />
        <a
          :disabled="!isIsoBuilt"
          class="btn role-primary"
          data-testid="download-iso-btn"
          @click="$event => downloadIso($event)"
        >
          {{ t('elemental.machineRegistration.edit.downloadIso') }}
        </a>
      </div>
    </div>
    <Banner
      v-if="isoBuildProcessOngoing && (!isoBuildTriggerError && !isoBuildProcessError)"
      color="warning"
      data-testid="build-iso-process-banner"
      v-html="'Build Process ongoing...'"
    />
    <Banner
      v-if="!isoBuildProcessOngoing && (isoBuildTriggerError || isoBuildProcessError)"
      color="error"
      data-testid="build-iso-banner"
      v-html="isoBuildTriggerError || isoBuildProcessError"
    />
  </div>
</template>

<style lang="scss" scoped>

</style>
