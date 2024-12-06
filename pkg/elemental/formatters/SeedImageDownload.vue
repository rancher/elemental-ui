<script>
import { MEDIA_TYPES } from '../components/BuildMedia.vue';

export default {
  props:      {
    value: {
      type:     Object,
      default: () => {}
    }
  },
  computed: {
    downloadLink() {
      return this.value?.downloadURL;
    },
    checksumLink() {
      return this.value?.checksumURL;
    }
  }
};
</script>

<template>
  <div>
    <div 
      v-if="!!downloadLink || !!checksumLink"
      class="download-group">
      <a
        v-if="!!downloadLink"
        class="btn role-primary"
        data-testid="download-media-btn-list"
        target="_blank"
        rel="noopener nofollow"
        :href="downloadLink"
      >
        {{ t('tableHeaders.download') }}
      </a>
      <a 
        v-if="!!checksumLink"
        data-testid="download-checksum-btn-list" 
        class="checksum-btn"
        target="_blank"
        rel="noopener nofollow"
        download="checksum.sh256"
        :href="checksumLink">{{ t('elemental.machineRegistration.edit.downloadChecksum') }}</a>
    </div>
    <p v-else>
      -
    </p>
  </div>
</template>

<style lang="scss" scoped>
.download-group {
  max-width: fit-content;
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;

  .checksum-btn {
    cursor: pointer;
    margin-top: 4px;
    font-size: 12px;
    text-align: center;
    text-decoration: underline;
  }
}
</style>