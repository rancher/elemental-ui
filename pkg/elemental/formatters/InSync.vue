<script>
import {
  getOperatorVersion,
  checkGatedFeatureCompatibility,
  CHANNEL_NO_LONGER_IN_SYNC,
  ALL_AREAS,
  ALL_MODES,
} from '../utils/feature-versioning';

export default {
  props:      {
    value: {
      type:     String,
      default: () => ''
    }
  },
  async fetch() {
    this.operatorVersion = await getOperatorVersion(this.$store);
  },
  data() {
    return { operatorVersion: '' };
  },
  computed: {
    supportChannelNoLongerInSync() {
      return checkGatedFeatureCompatibility(ALL_AREAS, ALL_MODES, CHANNEL_NO_LONGER_IN_SYNC, this.operatorVersion);
    },
    parsedValue() {
      if (this.supportChannelNoLongerInSync) {
        return this.value;
      } else {
        return this.t('elemental.osVersions.notApplicable');
      }
    },
    isOutOfSync() {
      return this.parsedValue === this.t('elemental.osVersions.outOfSync');
    }
  },
};
</script>

<template>
  <p :class="{ 'outOfSync': isOutOfSync }">
    {{ parsedValue }}
  </p>
</template>

<style lang="scss" scoped>
.outOfSync {
  color: var(--error);
}
</style>
