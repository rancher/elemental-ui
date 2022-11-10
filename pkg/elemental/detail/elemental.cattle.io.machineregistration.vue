<script>
import Loading from '@shell/components/Loading.vue';
import CruResource from '@shell/components/CruResource.vue';
import CreateEditView from '@shell/mixins/create-edit-view';
import YamlEditor, { EDITOR_MODES } from '@shell/components/YamlEditor';
import DetailText from '@shell/components/DetailText';
import AsyncButton from '@shell/components/AsyncButton';

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
    AsyncButton
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
      cloudConfig:  typeof this.value.spec === 'string' ? this.value.spec : saferDump(this.value.spec),
      yamlErrors:   null
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
          :value="registrationUrl"
          :label="t('elemental.machineRegistration.create.registrationURL.label')"
        />
      </div>
    </div>
    <div
      class="row mb-40"
    >
      <div class="col span-12">
        <h3>{{ t('elemental.machineRegistration.edit.imageSetup') }}</h3>
        <p v-html="t('elemental.machineRegistration.edit.downloadMachineRegistrationFile', {}, true)" />
        <AsyncButton class="mt-10" mode="download" @click="download" />
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
</style>
