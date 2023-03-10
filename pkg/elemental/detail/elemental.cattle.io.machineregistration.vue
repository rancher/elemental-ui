<script>
import Loading from '@shell/components/Loading.vue';
import CruResource from '@shell/components/CruResource.vue';
import CreateEditView from '@shell/mixins/create-edit-view';
import YamlEditor, { EDITOR_MODES } from '@shell/components/YamlEditor';
import DetailText from '@shell/components/DetailText';
import AsyncButton from '@shell/components/AsyncButton';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { Banner } from '@components/Banner';

import jsyaml from 'js-yaml';
import { saferDump } from '@shell/utils/create-yaml';
import { _CREATE, _EDIT } from '@shell/config/query-params';
import { exceptionToErrorsArray } from '@shell/utils/error';

export default {
  name:       'MachineRegistrationDetailView',
  components: {
    Loading,
    CruResource,
    YamlEditor,
    DetailText,
    AsyncButton,
    LabeledSelect,
    Banner
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
  data() {
    return {
      cloudConfig:        typeof this.value.spec === 'string' ? this.value.spec : saferDump(this.value.spec),
      buildIsoOsVersions: [
        {
          label: 'SLE micro stuff bananas',
          value: 'this-is-the-url-for-the-image'
        }
      ],
      buildIsoOsVersionSelected: 'this-is-the-url-for-the-image',
      isoReadyToDownload:        false,
      isoBuildError:             '',
      yamlErrors:                null
    };
  },
  watch: {
    cloudConfig: {
      handler(neu) {
        try {
          const parsed = jsyaml.load(neu);

          this.value.spec = parsed;
          this.yamlErrors = null;
        } catch (e) {
          this.yamlErrors = exceptionToErrorsArray(e);
        }
      },
      immediate: true
    }
  },
  computed: {
    registrationUrl() {
      return this.value?.status?.registrationURL || '';
    },
    isCreate() {
      return this.mode === _CREATE;
    },
    isView() {
      return this.mode !== _CREATE && this.mode !== _EDIT;
    },
    editorMode() {
      if (!this.isView) {
        return EDITOR_MODES.EDIT_CODE;
      }

      return EDITOR_MODES.VIEW_CODE;
    }
  },
  methods: {
    async buildIso(btnCb) {
      try {
        await setTimeout(() => {
          this.isoReadyToDownload = true;
          btnCb(true);
        }, 3000);
        // btnCb(true);
      } catch (error) {
        btnCb(false);
      }
    },
    async download(btnCb) {
      try {
        await this.value.downloadMachineRegistration();
        btnCb(true);
      } catch (error) {
        btnCb(false);
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
    <div
      class="row mt-40 mb-40"
    >
      <div class="col span-8">
        <h3>{{ t('elemental.machineRegistration.create.registrationURL.title') }}</h3>
        <DetailText
          v-show="registrationUrl"
          data-testid="registration-url"
          :value="registrationUrl"
          :label="t('elemental.machineRegistration.create.registrationURL.label')"
        />
      </div>
    </div>
    <h3 class="build-iso-title">
      {{ t('elemental.machineRegistration.edit.buildIsoTitle') }}
    </h3>
    <div
      class="row mb-10"
    >
      <div class="col span-4">
        <LabeledSelect
          v-model="buildIsoOsVersionSelected"
          class="mr-20"
          data-testid="mach-reg-select-build-os-version"
          :label="t('elemental.machineRegistration.edit.osVersion')"
          :placeholder="t('elemental.machineRegistration.edit.osVersionPlaceholder')"
          :options="buildIsoOsVersions"
        />
      </div>
      <div class="col mt-10 mb-10 span-4 flex">
        <AsyncButton
          mode="buildIso"
          class="mr-20"
          data-testid="mach-reg-build-iso-btn"
          @click="buildIso"
        />
        <a
          :disabled="!isoReadyToDownload"
          class="btn role-primary"
          href="#"
          download="iso"
          data-testid="mach-reg-download-iso-btn"
        >
          {{ t('elemental.machineRegistration.edit.downloadIso') }}
        </a>
      </div>
    </div>
    <Banner
      v-if="isoBuildError"
      class="mb-10"
      color="error"
      data-testid="mach-reg-build-iso-banner"
      v-html="isoBuildError"
    />
    <div
      class="row mb-40 mt-30"
    >
      <div class="col span-12">
        <h3>{{ t('elemental.machineRegistration.edit.imageSetup') }}</h3>
        <p v-html="t('elemental.machineRegistration.edit.downloadMachineRegistrationFile', {}, true)" />
        <AsyncButton
          class="mt-10"
          mode="downloadMachineReg"
          data-testid="download-btn"
          @click="download"
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <h3>{{ t('elemental.machineRegistration.create.cloudConfiguration') }}</h3>
        <YamlEditor
          ref="yamleditor"
          v-model="cloudConfig"
          class="mb-20"
          :editor-mode="editorMode"
        />
      </div>
    </div>
  </CruResource>
</template>

<style lang="scss" scoped>
.flex {
  display: flex;
}
</style>
