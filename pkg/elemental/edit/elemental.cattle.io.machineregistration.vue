<script>
import Loading from '@shell/components/Loading.vue';
import CruResource from '@shell/components/CruResource.vue';
import CreateEditView from '@shell/mixins/create-edit-view';
import { Banner } from '@components/Banner';
import YamlEditor, { EDITOR_MODES } from '@shell/components/YamlEditor';
import FileSelector from '@shell/components/form/FileSelector';
import KeyValue from '@shell/components/form/KeyValue';
import NameNsDescription from '@shell/components/form/NameNsDescription';

import jsyaml from 'js-yaml';
import { saferDump } from '@shell/utils/create-yaml';
import { _CREATE, _EDIT } from '@shell/config/query-params';
import { exceptionToErrorsArray } from '@shell/utils/error';

import Tabbed from '@shell/components/Tabbed/index.vue';
import Tab from '@shell/components/Tabbed/Tab.vue';

import { getOperatorVersion, checkGatedFeatureCompatibility, MACH_REG_CONFIG_DEFAULTS } from '../utils/feature-versioning';
import { OLD_DEFAULT_CREATION_YAML, DEFAULT_CREATION_YAML } from '../models/elemental.cattle.io.machineregistration';

export default {
  name:         'MachineRegistrationEditView',
  components:   {
    Loading,
    CruResource,
    YamlEditor,
    KeyValue,
    Banner,
    FileSelector,
    NameNsDescription,
    Tabbed,
    Tab
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
    }
  },
  async fetch() {
    // in CREATE mode, since YAMLEditor doesn't live update, we need to force a re-render of the component for it to update
    if (this.mode === _CREATE) {
      const operatorVersion = await getOperatorVersion(this.$store);

      this.newCloudConfigcompatibilityCheck = checkGatedFeatureCompatibility(this.value.type, this.mode, MACH_REG_CONFIG_DEFAULTS, operatorVersion);

      if (!this.value.spec) {
        this.value.spec = this.newCloudConfigcompatibilityCheck ? DEFAULT_CREATION_YAML : OLD_DEFAULT_CREATION_YAML;
      }

      this.cloudConfig = typeof this.value.spec === 'string' ? this.value.spec : saferDump(this.value.spec);
      this.rerender = true;
    }
  },
  data() {
    return {
      rerender:                         false,
      cloudConfig:                      typeof this.value.spec === 'string' ? this.value.spec : saferDump(this.value.spec),
      newCloudConfigcompatibilityCheck: false,
      yamlErrors:                       null,
      isFormValid:                      true
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
    },
    hasBeenCreated() {
      return !!this.value.id;
    }
  },
  methods: {
    async save(saveCb) {
      this.errors = [];
      try {
        await this.value.save();
        saveCb(true);

        if (this.isCreate) {
          this.$router.replace(this.value.detailLocation);
        } else {
          this.done();
        }
      } catch (err) {
        this.errors = exceptionToErrorsArray(err);
        saveCb(false);
      }
    },
    updateLabels(ev) {
      this.value.setLabels(ev, 'machineInventoryLabels', true);
      let keyLengthExceeded = false;
      let keyPrefixLengthExceeded = false;
      let keyNameLengthExceeded = false;
      let labelLengthExceeded = false;

      this.errors = [];

      if (this.value.spec.machineInventoryLabels && Object.keys(this.value.spec.machineInventoryLabels).length) {
        Object.keys(this.value.spec.machineInventoryLabels).forEach((key) => {
          // check length of "key" in key-value
          if (key.includes('/')) {
            const prefix = key.split('/')[0];
            const name = key.split('/')[1];

            if (prefix.length > 253) {
              keyPrefixLengthExceeded = true;
            }

            if (name.length > 63) {
              keyNameLengthExceeded = true;
            }
          } else if (key.length > 63) {
            keyLengthExceeded = true;
          }

          // check length of "value" in key-value
          if (this.value.spec.machineInventoryLabels[key].length > 63) {
            labelLengthExceeded = true;
          }
        });
      }

      if (labelLengthExceeded || keyLengthExceeded || keyPrefixLengthExceeded || keyNameLengthExceeded) {
        if (labelLengthExceeded) {
          this.isFormValid = false;
          this.errors.push(this.t('elemental.machineRegistration.validation.machineInventoryLabelValueLength'));
        }
        if (keyLengthExceeded) {
          this.isFormValid = false;
          this.errors.push(this.t('elemental.machineRegistration.validation.machineInventoryLabelKeyLength'));
        }
        if (keyPrefixLengthExceeded) {
          this.isFormValid = false;
          this.errors.push(this.t('elemental.machineRegistration.validation.machineInventoryLabelKeyPrefixLength'));
        }
        if (keyNameLengthExceeded) {
          this.isFormValid = false;
          this.errors.push(this.t('elemental.machineRegistration.validation.machineInventoryLabelKeyNameLength'));
        }
      } else {
        this.isFormValid = true;
      }
    },
    onFileSelected(value) {
      const component = this.$refs.yamleditor;

      if (component) {
        component.updateValue(value);
      }
    },
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
    :validation-passed="isFormValid"
    @error="e=>errors = e"
    @finish="save"
    @cancel="done"
  >
    <div
      class="row mb-40"
      :class="{'mt-40': !hasBeenCreated }"
    >
      <div class="col span-12">
        <h3>{{ t('elemental.machineRegistration.create.configuration') }}</h3>
        <NameNsDescription
          :value="value"
          :mode="mode"
          :description-hidden="true"
          :namespaced="false"
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-6">
        <h3>{{ t('elemental.machineRegistration.create.cloudConfiguration') }}</h3>
        <YamlEditor
          :key="rerender"
          ref="yamleditor"
          v-model:value="cloudConfig"
          class="mb-20"
          :editor-mode="editorMode"
        />
        <div
          v-if="!isView"
          class="mb-20"
        >
          <FileSelector
            class="btn role-secondary"
            data-testid="read-from-file-btn"
            :label="t('elemental.machineRegistration.create.readFromFile')"
            @selected="onFileSelected"
          />
        </div>
        <Banner
          v-for="(err, i) in yamlErrors"
          :key="i"
          color="error"
          :label="err"
        />
      </div>
    </div>
    <div class="row mb-40">
      <div class="col span-12">
        <h3 class="mt-10">
          {{ t('elemental.machineRegistration.create.labelsAndAnnotations') }}
        </h3>
        <Tabbed data-testid="labels-and-annotations-block">
          <Tab
            label-key="elemental.machineRegistration.create.machineInv"
            name="machine-inventory"
            data-testid="mach-inv-tab"
            :weight="3"
          >
            <Banner
              class="mb-40"
              color="info"
              data-testid="mach-inv-banner"
            >
              <div v-clean-html="t('elemental.machineRegistration.create.labelsAndAnnotationsMachInvBanner', {}, true)" />
            </Banner>
            <div class="row mb-30">
              <KeyValue
                key="labels"
                data-testid="add-label-mach-inv"
                :value="value.machineInventoryLabels"
                :add-label="t('labels.addLabel')"
                :mode="mode"
                :title="t('labels.labels.title')"
                :read-allowed="false"
                :value-can-be-empty="true"
                @update:value="updateLabels($event)"
              />
            </div>
            <div class="row mb-10">
              <KeyValue
                key="annotations"
                data-testid="add-annotation-mach-inv"
                :value="value.machineInventoryAnnotations"
                :add-label="t('labels.addAnnotation')"
                :mode="mode"
                :title="t('labels.annotations.title')"
                :read-allowed="false"
                :value-can-be-empty="true"
                @update:value="value.setAnnotations($event, 'machineInventoryAnnotations', true)"
              />
            </div>
          </Tab>
          <Tab
            label-key="elemental.machineRegistration.create.machineReg"
            name="machine-reg"
            data-testid="mach-reg-tab"
            :weight="2"
          >
            <Banner
              class="mb-40"
              color="info"
              data-testid="mach-reg-banner"
            >
              <div v-clean-html="t('elemental.machineRegistration.create.labelsAndAnnotationsMachRegBanner', {}, true)" />
            </Banner>
            <div class="row mb-30">
              <KeyValue
                key="labels"
                data-testid="add-label-mach-reg"
                :value="value.labels"
                :add-label="t('labels.addLabel')"
                :mode="mode"
                :title="t('labels.labels.title')"
                :read-allowed="false"
                :value-can-be-empty="true"
                @update:value="value.setLabels($event)"
              />
            </div>
            <div class="row mb-10">
              <KeyValue
                key="annotations"
                data-testid="add-annotation-mach-reg"
                :value="value.annotations"
                :add-label="t('labels.addAnnotation')"
                :mode="mode"
                :title="t('labels.annotations.title')"
                :read-allowed="false"
                :value-can-be-empty="true"
                @update:value="value.setAnnotations($event)"
              />
            </div>
          </Tab>
        </Tabbed>
      </div>
    </div>
  </CruResource>
</template>

<style lang="scss" scoped>
</style>
