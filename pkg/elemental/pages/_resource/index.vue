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

    // Pre-fetch the current resource with force:true so the store has fresh data
    // before ResourceList's $fetch runs in mounted(). This bypasses any stale haveAll
    // cache that may have been set by other components (e.g. BuildMedia, managedosimage edit).
    await this.$store.dispatch(`management/findAll`, {
      type: this.$route.params.resource,
      opt:  { force: true },
    });
  },

  mounted() {
    // ResourceList.fetch() is not automatically invoked in the extension routing context:
    // extensions use Vue Router, not Nuxt's navigation guards that normally trigger child
    // component fetch hooks. Calling $fetch() here explicitly runs ResourceList.fetch(),
    // which calls $fetchType() and registers the resource in fetchedResourceType —
    // without that entry, rows() always returns [].
    this.$nextTick(() => {
      this.$refs.resourceList?.$fetch?.();
    });
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
  <ResourceList ref="resourceList" :has-advanced-filtering="advancedFilteringEnabled">
  </ResourceList>
</template>
