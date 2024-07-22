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
    hasDownloadLink() {
      return !!this.value?.downloadURL;
    },
  },
  methods: {
    downloadSeedImage(ev) {
      ev.preventDefault();

      if (this.hasDownloadLink) {
        const downloadUrl = this.value?.downloadURL;
        const link = document.createElement('a');

        const isIso = !!(this.value?.downloadURL && this.value?.downloadURL.includes('.iso'));

        link.download = `elemental.${ isIso ? MEDIA_TYPES.ISO.extension : MEDIA_TYPES.RAW.extension }`;
        link.href = downloadUrl;
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
      }
    }
  }
};
</script>

<template>
  <div>
    <button
      v-if="hasDownloadLink"
      class="btn role-primary"
      @click="downloadSeedImage"
    >
      {{ t('tableHeaders.download') }}
    </button>
    <p v-else>
      -
    </p>
  </div>
</template>
