<script>
import { CATALOG } from '@shell/config/types';
import Loading from '@shell/components/Loading';
import InstallView from '../components/InstallView';
import DashboardView from '../components/DashboardView';
import { ELEMENTAL_SCHEMA_IDS } from '../config/elemental-types';

export default {
  name:       'BaseView',
  components: {
    Loading,
    InstallView,
    DashboardView
  },
  async fetch() {
    // this covers scenario where Elemental Operator is deleted from Apps and we lose the Elemental Admin role for Standard Users...
    if (this.$store.getters['management/canList'](ELEMENTAL_SCHEMA_IDS.MACHINE_REGISTRATIONS)) {
      let installedApps;

      // needed to check if operator is installed
      if (this.$store.getters['management/canList'](CATALOG.APP)) {
        installedApps = await this.$store.dispatch('management/findAll', { type: CATALOG.APP });
      }

      const elementalSchema = this.$store.getters['management/schemaFor'](ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES);

      // we need to check for the length of the response
      // due to some issue with a standard-user, which can list apps
      // but the list comes up empty []
      const isElementalOperatorNotInstalledOnApps = installedApps?.length && !installedApps?.find(item => item.id.includes('elemental-operator') && !item.id.includes('elemental-operator-crds'));

      // check if operator is installed
      if (!elementalSchema || isElementalOperatorNotInstalledOnApps) {
        this.isElementalOpInstalled = false;
      }
    } else {
      this.isElementalOpInstalled = false;
    }
  },
  data() {
    return { isElementalOpInstalled: true };
  }
};
</script>

<template>
  <div>
    <Loading v-if="$fetchState.pending" />
    <!-- Elemental Operator not installed -->
    <InstallView
      v-else-if="!isElementalOpInstalled"
    />
    <!-- Dashboard view -->
    <DashboardView v-else />
  </div>
</template>

<style lang="scss" scoped>
</style>
