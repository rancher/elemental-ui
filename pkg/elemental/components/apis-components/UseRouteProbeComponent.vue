<script>
import { useRoute } from 'vue-router';

export default {
  name: 'UseRouteProbeComponent',

  setup() {
    // Compatibility probe for rancher/dashboard#18635. vue-router is replaced with the compat stub
    // (@shell/pkg/vue-router.lib.js) at extension build time. On Rancher <= 2.11 there is no
    // window.__vueRouter, so this exercises the stub's $route fallback; from 2.12 it delegates to
    // the host's real router. Either way useRoute() must return a usable route object.
    const route = useRoute();

    return { routeCheck: route?.path ? 'USE ROUTE OK' : 'USE ROUTE MISSING' };
  }
};
</script>

<template>
  <div data-testid="extension-use-route-probe">
    {{ routeCheck }}
  </div>
</template>
