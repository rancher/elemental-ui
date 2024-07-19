<script>
import { ToggleSwitch } from '@components/Form/ToggleSwitch';
import { ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';
export default {
  components: { ToggleSwitch },

  props:      {
    value: {
      type:     Object,
      default: () => {}
    }
  },

  data() {
    return { actionInProgress: false };
  },

  computed: {
    currentValue() {
      return !!this.$store.getters['management/byId'](ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS, `fleet-default/${ this.value?.defaultName }`);
    },
    currentResource() {
      return this.$store.getters['management/byId'](ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS, `fleet-default/${ this.value?.defaultName }`);
    },
    disabled() {
      return this.value?.toggleSwitchDisabled;
    }
  },

  methods: {
    async handleSwitch(val) {
      console.log('switchHandler', val);

      // If TRUE, then create the resource instance
      if (val) {
        this.actionInProgress = true;

        const osVersionChannelObject = {
          metadata: {
            namespace: 'fleet-default',
            name:      this.value?.defaultName
          },
          spec: {
            options: { image: this.value?.uri },
            type:    'custom'
          },
          type: ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS,
        };

        const osVersionChannelModel = await this.$store.dispatch('management/create', osVersionChannelObject);

        try {
          await osVersionChannelModel.save({ url: `/v1/${ ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS }`, method: 'POST' });
        } catch (e) {
        }
      } else {
        // DELETE the resource instance
        try {
          await this.currentResource.save({ url: `/v1/${ ELEMENTAL_SCHEMA_IDS.MANAGED_OS_VERSION_CHANNELS }/${ this.currentResource?.id }`, method: 'DELETE' });
        } catch (e) {
        }
      }
    }
  },
};
</script>

<template>
  <div
    :class="{ 'disabled': disabled, 'asyncAction': actionInProgress }"
    class="t-switch-container"
  >
    <ToggleSwitch
      class="t-switch"
      :value="currentValue"
      :off-value="false"
      :on-value="true"
      @input="handleSwitch"
    />
  </div>
</template>

<style lang="scss" scoped>
.t-switch-container.disabled {
  position: relative;

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    content: '';
    display: block;
    cursor: not-allowed;
  }

  .t-switch::v-deep {
    & {
      // color: var(--input-disabled-text);
      // background-color: var(--input-disabled-bg);
      // outline-width: 0;
      // border-color: var(--input-disabled-border);
      // cursor: not-allowed;
      // label {
      //   color: var(--input-disabled-label);
      //   display: inline-block;
      //   z-index: 1;
      // }
      // &::placeholder {
      //     color: var(--input-disabled-placeholder);
      // }

    }
    .slider.round::before {
      background-color: var(--input-disabled-placeholder);
    }
    .slider  {
      background-color: var(--input-disabled-text);
    }
  }
}
</style>
