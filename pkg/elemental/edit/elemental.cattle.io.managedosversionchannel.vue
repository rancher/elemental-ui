<script>
import Loading from '@shell/components/Loading.vue';
import CruResource from '@shell/components/CruResource.vue';
import CreateEditView from '@shell/mixins/create-edit-view';
import { LabeledInput } from '@components/Form/LabeledInput';
import NameNsDescription from '@shell/components/form/NameNsDescription';

export default {
  name:       'ManagedOsVersionChannelEditView',
  components: {
    Loading,
    LabeledInput,
    CruResource,
    NameNsDescription
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
  }
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
        <h3>{{ t('elemental.osversionchannels.create.configuration') }}</h3>
        <NameNsDescription v-model="value" :mode="mode" :description-hidden="true" :namespaced="false" />
      </div>
    </div>
    <div v-if="value.spec" class="row mb-20">
      <div class="col span-6 mb-20">
        <h3>{{ t('elemental.osversionchannels.create.spec') }}</h3>
        <LabeledInput
          v-model.trim="value.spec.options.image"
          data-testid="os-version-channel-path"
          :label="t('elemental.osversionchannels.create.registryUri.label')"
          :placeholder="t('elemental.osversionchannels.create.registryUri.placeholder', null, true)"
          :mode="mode"
        />
      </div>
    </div>
  </CruResource>
</template>
