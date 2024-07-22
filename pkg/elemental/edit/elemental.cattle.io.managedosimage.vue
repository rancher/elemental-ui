<script>
import Loading from '@shell/components/Loading.vue';
import CruResource from '@shell/components/CruResource.vue';
import CreateEditView from '@shell/mixins/create-edit-view';
import { LabeledInput } from '@components/Form/LabeledInput';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import { RadioGroup } from '@components/Form/Radio';
import { allHash } from '@shell/utils/promise';
import { _CREATE, _EDIT, _VIEW } from '@shell/config/query-params';
import { CAPI } from '@shell/config/types';
import { ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';
import {
  filterForElementalClusters,
  filterForUsedElementalClustersOnManagedOs
} from '../utils/elemental-utils';

const STRING_SEPARATOR = '_***_';

export default {
  name:       'ManagedOsImagesEditView',
  components: {
    Loading, LabeledInput, LabeledSelect, CruResource, NameNsDescription, RadioGroup
  },
  mixins:     [CreateEditView],
  props:      {
    value: {
      type:     Object,
      required: true
    },
    mode: {
      type:     String,
      required: true
    },
  },
  async fetch() {
    const hash = {};

    hash.rancherClusters = this.$store.dispatch('management/findAll', { type: CAPI.RANCHER_CLUSTER });
    hash.osGroups = this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_IMAGES });
    hash.osVersions = this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSIONS });
    hash.osVersionChannels = this.$store.dispatch('management/findAll', { type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS });

    const res = await allHash(hash);

    this.elementalClusters = filterForElementalClusters(res.rancherClusters || []);
    this.osGroups = res.osGroups || [];
    this.osVersions = res.osVersions || [];
    this.osVersionChannels = res.osVersionChannels || [];

    if ((this.mode === _EDIT || this.mode === _VIEW)) {
      // populate OS version selected
      if (this.value?.spec?.managedOSVersionName) {
        this.osVersionSelected = this.value?.spec?.managedOSVersionName;
        this.useManagedOsImages = true;
      } else {
        this.useManagedOsImages = false;
      }

      // populate cluster targets selected
      if (this.value?.spec?.clusterTargets?.length) {
        const targetsArray = [];

        this.value?.spec?.clusterTargets.forEach((ct) => {
          targetsArray.push(ct.clusterName);
        });

        this.clusterTargets = targetsArray;
      }
    }
  },
  data() {
    return {
      elementalClusters:  [],
      osGroups:           [],
      osVersions:         [],
      osVersionChannels:  [],
      clusterTargets:     [],
      useManagedOsImages: true,
      osVersionSelected:  ''
    };
  },
  computed: {
    clusterTargetOptions() {
      const targetableClusters = filterForUsedElementalClustersOnManagedOs(this.elementalClusters, this.osGroups);

      return targetableClusters.map((cluster) => {
        return {
          label: cluster.name,
          value: cluster.name
        };
      });
    },
    managedOSVersionOptions() {
      const out = [];

      this.osVersionChannels.forEach((channel) => {
        const versions = this.osVersions.filter((version) => {
          // use only the same namespace as the OS groups for now...
          const channelExists = version.metadata?.ownerReferences.find(ref => ref.name === channel.name && this.value?.metadata?.namespace === channel.metadata?.namespace);

          return channelExists && Object.keys(channelExists).length && this.value?.metadata?.namespace === version.metadata?.namespace && version.spec?.type === 'container';
        });

        if (versions.length) {
          out.push({
            kind:  'group',
            label: this.t('elemental.osimage.create.managedOsImage.channel', { name: channel.name }),
            value: this.t('elemental.osimage.create.managedOsImage.channel', { name: channel.name })
          });

          versions.forEach((v) => {
            out.push({
              label: v.name,
              value: `${ channel.name }${ STRING_SEPARATOR }${ v.name }`
            });
          });
        }
      });

      return out;
    },
    isCreate() {
      return this.mode === _CREATE;
    }
  },
  methods: {
    handleClusterTargetChange(ev) {
      this.value.spec.clusterTargets = ev.map((val) => {
        return { clusterName: val };
      });
    },
    handleManagedOSVersionNameChange(ev) {
      this.value.spec.managedOSVersionName = ev.split(STRING_SEPARATOR)[1];
    },
    handleRadioBtnChange(val) {
      // if TRUE, this mean we are on option "use managed OS version"
      // so we should clear the "image path" (OS image) field
      if (val) {
        delete this.value?.spec?.osImage;
      } else {
        delete this.value?.spec?.managedOSVersionName;
        this.osVersionSelected = '';
      }
    }
  },
};
</script>

<template>
  <Loading v-if="!value" />
  <CruResource
    v-else
    :done-route="doneRoute"
    :can-yaml="true"
    :mode="mode"
    :resource="value"
    :errors="errors"
    @error="e=>errors = e"
    @finish="save"
    @cancel="done"
  >
    <div class="row mt-40 mb-20">
      <div class="col span-12 mb-20">
        <h3>{{ t('elemental.osimage.create.configuration') }}</h3>
        <NameNsDescription v-model="value" :mode="mode" :description-hidden="true" :namespaced="false" />
      </div>
    </div>
    <div v-if="value.spec" class="row mb-20">
      <div class="col span-6 mb-20">
        <h3>{{ t('elemental.osimage.create.spec') }}</h3>
        <LabeledSelect
          v-model="clusterTargets"
          class="mb-10"
          data-testid="cluster-target"
          :label="t('elemental.osimage.create.targetCluster.label')"
          :placeholder="t('elemental.osimage.create.targetCluster.placeholder', null, true)"
          :mode="mode"
          :options="clusterTargetOptions"
          :multiple="true"
          @input="handleClusterTargetChange($event)"
        />
        <p v-clean-html="t('elemental.osimage.create.userWarning',{}, true)" class="user-warn mb-20"></p>
        <RadioGroup
          v-model="useManagedOsImages"
          class="mb-20"
          data-testid="upgrade-choice-selector"
          name="os-image-mode"
          :options="[true, false]"
          :labels="[t('elemental.osimage.create.radioOptions.osImages'), t('elemental.osimage.create.radioOptions.registry')]"
          :mode="mode"
          @input="handleRadioBtnChange($event)"
        />
        <div v-if="useManagedOsImages">
          <LabeledSelect
            v-model="osVersionSelected"
            data-testid="os-version-box"
            :mode="mode"
            :options="managedOSVersionOptions"
            label-key="elemental.osimage.create.managedOsImage.label"
            :placeholder="t('elemental.osimage.create.managedOsImage.placeholder', null, true)"
            option-key="value"
            @input="handleManagedOSVersionNameChange($event)"
          />
        </div>
        <div v-else>
          <LabeledInput
            v-model.trim="value.spec.osImage"
            data-testid="os-image-box"
            :label="t('elemental.osimage.create.osImage.label')"
            :placeholder="t('elemental.osimage.create.osImage.placeholder', null, true)"
            :mode="mode"
          />
        </div>
      </div>
    </div>
  </CruResource>
</template>

<style lang="scss" scoped>
.user-warn {
  font-size: 13px;
  color: var(--darker);
}
</style>
