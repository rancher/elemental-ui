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
  },
  data() {
    return {
      seedImagesList:     [],
      buildIsoOsVersions: [
        {
          label: 'Elemental Teal x86 64bit',
          value: 'https://download.opensuse.org/repositories/isv:/Rancher:/Elemental:/Staging:/Teal53/media/iso/elemental-teal.x86_64.iso'
        }
      ],
      buildIsoOsVersionSelected:    'https://download.opensuse.org/repositories/isv:/Rancher:/Elemental:/Staging:/Teal53/media/iso/elemental-teal.x86_64.iso',
      registrationEndpointSelected: '',
      isoBuildTriggerError:         '',
      seedImage:                    undefined,
      buildBtnCallback:             undefined
    };
  },
  computed: {
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
      return this.displayRegEndpoints ? (this.buildIsoOsVersionSelected && this.registrationEndpointSelected) : this.buildIsoOsVersionSelected;
    },
    seedImageFound() {
      if (this.seedImage) {
        const imgFound = this.seedImagesList.find(img => img.metadata?.uid === this.seedImage.metadata?.uid);

        if (imgFound) {
          return imgFound;
        }
      }

      return {};
    },
    isIsoBuilt() {
      if (this.seedImageFound && this.seedImageFound.status?.downloadURL) {
        this.buildBtnCallback(true);

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
            this.buildBtnCallback(false);
            errorFound = condition.message;
            break;
          }
        }

        if (errorFound) {
          return errorFound;
        }
      }

      return '';
    }
  },
  methods: {
    async buildIso(btnCb) {
      this.isoBuildTriggerError = '';
      this.seedImage = undefined;
      const machineRegName = this.displayRegEndpoints ? this.registrationEndpointSelected.split('/')[1] : this.registrationEndpoint.split('/')[1];
      const machineRegNamespace = this.displayRegEndpoints ? this.registrationEndpointSelected.split('/')[0] : this.registrationEndpoint.split('/')[0];

      const seedImageModel = await this.$store.dispatch('management/create', {
        metadata: {
          name:      `iso-image-reg-${ machineRegName }-${ randomStr(8, CHARSET.ALPHA_LOWER ) }`,
          namespace: 'fleet-default'
        },
        spec: {
          baseImage:       this.buildIsoOsVersionSelected,
          registrationRef: {
            name:      machineRegName,
            namespace: machineRegNamespace
          }
        },
        type: ELEMENTAL_SCHEMA_IDS.SEED_IMAGE,
      });

      try {
        this.seedImage = await seedImageModel.save({ url: `/v1/${ ELEMENTAL_SCHEMA_IDS.SEED_IMAGE }`, method: 'POST' });
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
          :disabled="!isBuildIsoBtnEnabled"
          @click="buildIso"
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
      v-if="isoBuildTriggerError || isoBuildProcessError"
      color="error"
      data-testid="build-iso-banner"
      v-html="isoBuildTriggerError || isoBuildProcessError"
    />
  </div>
</template>

<style lang="scss" scoped>

</style>
