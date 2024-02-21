<script>
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { Banner } from '@components/Banner';
import AsyncButton from '@shell/components/AsyncButton';
import { randomStr, CHARSET } from '@shell/utils/string';
import { ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';

const MEDIA_TYPES = {
  RAW: {
    filterType: 'container',
    type:       'raw',
    label:      'Raw',
    extension:  'img'
  },
  ISO: {
    type:      'iso',
    label:     'Iso',
    extension: 'iso'
  }
};

export default {
  name:       'BuildMedia',
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
    this.managedOsVersions = await this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS });
  },
  data() {
    return {
      seedImagesList:               [],
      managedOsVersions:            [],
      filteredManagedOsVersions:    [],
      buildMediaOsVersions:         [],
      buildMediaTypes:              [
        { label: MEDIA_TYPES.ISO.label, value: MEDIA_TYPES.ISO.type },
        { label: MEDIA_TYPES.RAW.label, value: MEDIA_TYPES.RAW.type },
      ],
      buildMediaTypeSelected:       '',
      buildMediaOsVersionSelected:  '',
      registrationEndpointSelected: '',
      mediaBuildTriggerError:       '',
      seedImage:                    undefined,
      buildBtnCallback:             undefined
    };
  },
  watch: {
    buildMediaTypeSelected(neu) {
      if (neu) {
        this.buildMediaOsVersionSelected = '';
        const selectedFilterType = neu === MEDIA_TYPES.ISO.type ? MEDIA_TYPES.ISO.type : MEDIA_TYPES.RAW.filterType;

        this.filteredManagedOsVersions = this.managedOsVersions.filter(v => v.spec?.type === selectedFilterType) || [];
        this.buildMediaOsVersions = this.filteredManagedOsVersions.map((f) => {
          return {
            label: `${ f.spec?.metadata?.displayName } ${ f.spec?.version }`,
            value: neu === MEDIA_TYPES.ISO.type ? f.spec?.metadata?.uri : f.spec?.metadata?.upgradeImage,
          };
        });
      }
    }
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
    isBuildMediaBtnEnabled() {
      if (this.displayRegEndpoints) {
        return this.registrationEndpointSelected && this.buildMediaOsVersionSelected && this.buildMediaTypeSelected;
      }

      return this.buildMediaOsVersionSelected && this.buildMediaTypeSelected;
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
    isMediaBuilt() {
      if (this.seedImageFound && this.seedImageFound.status?.downloadURL) {
        this.buildBtnCallback(true);

        return true;
      }

      return false;
    },
    mediaBuildProcessError() {
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
    async buildMedia(btnCb) {
      this.mediaBuildTriggerError = '';
      this.seedImage = undefined;
      const machineRegName = this.displayRegEndpoints ? this.registrationEndpointSelected.split('/')[1] : this.registrationEndpoint.split('/')[1];
      const machineRegNamespace = this.displayRegEndpoints ? this.registrationEndpointSelected.split('/')[0] : this.registrationEndpoint.split('/')[0];

      const seedImageModel = await this.$store.dispatch('management/create', {
        metadata: {
          name:      `media-image-reg-${ machineRegName }-${ randomStr(8, CHARSET.ALPHA_LOWER ) }`,
          namespace: 'fleet-default'
        },
        spec: {
          type:            this.buildMediaTypeSelected,
          baseImage:       this.buildMediaOsVersionSelected,
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
        this.mediaBuildTriggerError = e;
        btnCb(false);
      }
    },
    downloadMedia(ev) {
      ev.preventDefault();

      if (this.isMediaBuilt) {
        const downloadUrl = this.seedImageFound?.status?.downloadURL;
        const link = document.createElement('a');

        link.download = `elemental.${ this.buildMediaTypeSelected === MEDIA_TYPES.ISO.type ? MEDIA_TYPES.ISO.extension : MEDIA_TYPES.RAW.extension }`;
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
      {{ t('elemental.machineRegistration.edit.buildMediaTitle') }}
    </h3>
    <div class="row mb-10">
      <div
        v-if="displayRegEndpoints"
        class="col span-2"
      >
        <LabeledSelect
          v-model="registrationEndpointSelected"
          class="mr-20"
          data-testid="select-registration-endpoint-build-media"
          :label="t('elemental.machineRegistration.create.machineReg')"
          :placeholder="t('elemental.dashboard.regEndpointPlaceholder')"
          :options="registrationEndpointsOptions"
        />
      </div>
      <div class="col span-2">
        <LabeledSelect
          v-model="buildMediaTypeSelected"
          class="mr-20"
          data-testid="select-media-type-build-media"
          :label="t('elemental.machineRegistration.edit.mediaType')"
          :placeholder="t('elemental.machineRegistration.edit.mediaTypePlaceholder')"
          :options="buildMediaTypes"
          option-key="value"
        />
      </div>
      <div class="col span-3">
        <LabeledSelect
          v-model="buildMediaOsVersionSelected"
          class="mr-20"
          data-testid="select-os-version-build-media"
          :label="t('elemental.machineRegistration.edit.osVersion')"
          :disabled="!buildMediaTypeSelected"
          :placeholder="t('elemental.machineRegistration.edit.osVersionPlaceholder')"
          :options="buildMediaOsVersions"
          option-key="value"
        />
      </div>
      <div class="col mt-10 span-5 flex">
        <AsyncButton
          mode="buildMedia"
          class="mr-20"
          data-testid="build-media-btn"
          :disabled="!isBuildMediaBtnEnabled || isMediaBuilt"
          @click="buildMedia"
        />
        <a
          :disabled="!isMediaBuilt"
          class="btn role-primary"
          data-testid="download-media-btn"
          @click="$event => downloadMedia($event)"
        >
          {{ t('elemental.machineRegistration.edit.downloadMedia') }}
        </a>
      </div>
    </div>
    <Banner
      v-if="mediaBuildTriggerError || mediaBuildProcessError"
      color="error"
      data-testid="build-media-banner"
    >
      <div v-clean-html="mediaBuildTriggerError || mediaBuildProcessError" />
    </Banner>
  </div>
</template>

<style lang="scss" scoped>

</style>
