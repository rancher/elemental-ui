<script>
import ResourceList from '@shell/components/ResourceList/index.vue';
import { ELEMENTAL_SCHEMA_IDS } from '../../config/elemental-types';
import { ELEMENTAL_DEFAULT_NAMESPACE } from '../../types';

export default {
  name:       'ListElementalResource',
  components: { ResourceList },
  async fetch() {
    // needed to populate cluster name col on machine inventories list
    if (this.isMachineInv) {
      await this.$store.dispatch(`management/findAll`, { type: ELEMENTAL_SCHEMA_IDS.MACHINE_INV_SELECTOR });
    }
  },
  data() {
    return { ELEMENTAL_DEFAULT_NAMESPACE };
  },
  computed: {
    isMachineInv() {
      return this.$route.params.resource === ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES;
    },
    advancedFilteringEnabled() {
      return !!this.isMachineInv;
    }
  }
};
</script>

<template>
  <ResourceList :has-advanced-filtering="advancedFilteringEnabled">
  </ResourceList>
</template>
