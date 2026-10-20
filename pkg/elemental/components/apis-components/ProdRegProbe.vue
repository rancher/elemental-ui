<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';

// Shared body for every Product Registration API probe page. Each registered page is a thin
// wrapper that passes its own marker, so a Cypress assertion can tell the pages apart while the
// rendering logic lives in one place.
//
// NOTE: the route is read off the instance proxy rather than via useRoute(). An extension-bundled
// component calling useRoute() is exactly the path that broke on Rancher versions without
// window.__vueRouter (rancher/dashboard#18635, already probed by UseRouteProbeComponent) - this
// page should be testing product registration, not re-testing that.

const props = defineProps<{ marker: string }>();

const instance = getCurrentInstance();

const routeName = computed<string>(() => String((instance?.proxy as any)?.$route?.name ?? 'unknown'));
</script>

<template>
  <div>
    <h2>Product Registration Probe</h2>
    <code data-testid="prod-reg-probe">PRODREG PAGE OK: {{ props.marker }}</code>
    <p class="mt-20">
      Generated route name: <code data-testid="prod-reg-route">{{ routeName }}</code>
    </p>
  </div>
</template>
