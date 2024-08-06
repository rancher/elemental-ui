<script>
export default {
  props:      {
    value: {
      type:     String,
      default: () => ''
    }
  },
  computed: {
    isOutOfSync() {
      return this.value === this.t('elemental.osVersions.outOfSync');
    }
  },
};
</script>

<template>
  <p :class="{ 'outOfSync': isOutOfSync }">
    {{ value }}
  </p>
</template>

<style lang="scss" scoped>
.outOfSync {
  color: var(--error);
}
</style>
