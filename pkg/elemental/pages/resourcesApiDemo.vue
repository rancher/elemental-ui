<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import RcButton from '@components/RcButton/RcButton.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - shell/utils/version is plain JS with no type declarations
import { getVersionInfo, compare } from '@shell/utils/version';

// Compatibility probe for the Resources API (Rancher 2.15+).
//
// Covers the FULL method surface of both ClusterApi and MgmtApi:
//   create, find, findAll, findFiltered (x3 overloads), update, replace, delete
//
// NOTE: there is deliberately no `import { useResources, K8S } from '@shell/apis'` here. This
// extension is rebuilt against the shell of EVERY Rancher version in the compatibility matrix
// (2.10 -> latest), so a static import of a 2.15-only module would fail `yarn build-pkg` on the
// older legs instead of degrading. `useResources()` is just `inject('$resources')` and shell also
// exposes it as a global property (apis/vue-shim.d.ts), so reaching it off the instance costs
// nothing on hosts that never provide it - there it is simply undefined.
//
// For the same reason the K8S constants are inlined: they are plain type strings.

const RESOURCE_TYPES = {
  CONFIG_MAP:   'configmap',
  POD:          'pod',
  SETTING:      'management.cattle.io.setting',
  MGMT_CLUSTER: 'management.cattle.io.cluster',
};

const NS = 'default';
// Created by the compatibility spec's runSetup(), so `find` has a deterministic target.
const SETUP_CM = 'ext-compat-cm';
const SETUP_POD = 'ext-compat-pod';
// Created and removed by the probes themselves, so each one is re-runnable (the compatibility
// suite retries up to 3 times in run mode).
const PROBE_CM = 'ext-compat-resources-api-cm';
const PROBE_SETTING = 'ext-compat-probe-setting';

const MIN_VERSION = 'v2.15.0';

const store = useStore();
const instance = getCurrentInstance();

const result = ref('No result yet. Press a button to probe the Resources API.');

/** The Resources API provider, or null on hosts that predate it. */
const resources = computed<any>(() => (instance?.proxy as any)?.$resources ?? null);

const hostVersion = computed<string>(() => getVersionInfo(store).fullVersion);

/**
 * Does the host claim a version that should carry the Resources API?
 *
 * getVersionInfo() falls back to the literal string 'unknown' when the rancher-version setting
 * has not loaded. compare() parses that as a single non-numeric part and can rank it ABOVE
 * '2.15.0', which would make the page claim a regression on a host that simply has not reported
 * its version yet - so anything that is not a recognisable vX.Y.Z is treated as "not expected".
 */
const apiExpected = computed<boolean>(() => {
  const version = hostVersion.value;

  if (!version || !/^v?\d+\.\d+/.test(version)) {
    return false;
  }

  try {
    return compare(version, MIN_VERSION) >= 0;
  } catch {
    return false;
  }
});

const apiPresent = computed<boolean>(() => !!resources.value);

/**
 * Single line summarising availability. Asserted directly by the compatibility spec so that the
 * older matrix legs prove graceful degradation rather than being skipped.
 */
const availability = computed<string>(() => {
  if (apiPresent.value) {
    return `RESOURCES API AVAILABLE (host ${ hostVersion.value })`;
  }

  // Host says it is new enough but did not provide $resources - a real regression, not a version gap.
  if (apiExpected.value) {
    return `RESOURCES API MISSING ON SUPPORTED HOST (host ${ hostVersion.value })`;
  }

  return `RESOURCES API UNAVAILABLE (host ${ hostVersion.value })`;
});

/** Guard every probe so an unsupported host reports the same deterministic string. */
const withApi = async(label: string, fn: (api: any) => Promise<string>) => {
  if (!apiPresent.value) {
    result.value = availability.value;

    return;
  }

  try {
    result.value = await fn(resources.value);
  } catch (e: any) {
    result.value = `${ label } FAILED: ${ e?.message || e }`;
  }
};

// ── ClusterApi ──────────────────────────────────────────────────────────────────────

const clusterCreate = () => withApi('CLUSTER CREATE', async(api) => {
  // Tolerate a leftover from a previously failed run.
  try {
    await api.cluster.delete(RESOURCE_TYPES.CONFIG_MAP, `${ NS }/${ PROBE_CM }`);
  } catch {}

  const created = await api.cluster.create({
    type:     RESOURCE_TYPES.CONFIG_MAP,
    metadata: { name: PROBE_CM, namespace: NS },
    data:     { probe: 'v1' }
  });

  return `CLUSTER CREATE OK: ${ created?.metadata?.name }`;
});

const clusterFind = () => withApi('CLUSTER FIND', async(api) => {
  const cm = await api.cluster.find(RESOURCE_TYPES.CONFIG_MAP, `${ NS }/${ SETUP_CM }`);

  return `CLUSTER FIND OK: ${ cm?.metadata?.name }`;
});

const clusterFindAll = () => withApi('CLUSTER FINDALL', async(api) => {
  const pods = await api.cluster.findAll(RESOURCE_TYPES.POD);

  return `CLUSTER FINDALL OK: ${ Array.isArray(pods) && pods.length > 0 }`;
});

/** findAll with FindAllMethodOptions - namespace filtering. */
const clusterFindAllOpts = () => withApi('CLUSTER FINDALL OPTS', async(api) => {
  const pods = await api.cluster.findAll(RESOURCE_TYPES.POD, { namespaced: [NS] });
  const names = (pods || []).map((p: any) => p?.metadata?.name);

  return `CLUSTER FINDALL OPTS OK: ${ names.includes(SETUP_POD) }`;
});

/** findFiltered overload 1 - transient pagination, response NOT cached. */
const clusterFindFilteredTransient = () => withApi('CLUSTER FINDFILTERED TRANSIENT', async(api) => {
  const page = await api.cluster.findFiltered(RESOURCE_TYPES.POD, {
    transient:  true,
    pagination: {
      page: 1, pageSize: 1, filters: [], sort: []
    }
  });

  return `CLUSTER FINDFILTERED TRANSIENT OK: ${ page?.data?.length }`;
});

/** findFiltered overload 2 - cached pagination, returns an array. */
const clusterFindFilteredPage = () => withApi('CLUSTER FINDFILTERED PAGE', async(api) => {
  const pods = await api.cluster.findFiltered(RESOURCE_TYPES.POD, {
    pagination: {
      page: 1, pageSize: 1, filters: [], sort: []
    }
  });

  return `CLUSTER FINDFILTERED PAGE OK: ${ Array.isArray(pods) && pods.length <= 1 }`;
});

/** findFiltered overload 3 - label selector. */
const clusterFindFilteredLabel = () => withApi('CLUSTER FINDFILTERED LABEL', async(api) => {
  const res = await api.cluster.findFiltered(RESOURCE_TYPES.POD, { labelSelector: { matchLabels: { 'ext-compat': 'probe' } } });
  const list = Array.isArray(res) ? res : (res?.data ?? []);

  // No pod carries this label, so an empty-but-successful response is the correct outcome: it
  // proves the selector round-tripped rather than that any particular pod exists.
  return `CLUSTER FINDFILTERED LABEL OK: ${ Array.isArray(list) }`;
});

/** update - HTTP PATCH, partial payload. */
const clusterUpdate = () => withApi('CLUSTER UPDATE', async(api) => {
  const id = `${ NS }/${ PROBE_CM }`;

  await api.cluster.update(RESOURCE_TYPES.CONFIG_MAP, id, { data: { probe: 'v2' } });

  const after = await api.cluster.find(RESOURCE_TYPES.CONFIG_MAP, id);

  return `CLUSTER UPDATE OK: ${ after?.data?.probe }`;
});

/** replace - HTTP PUT, whole object, runs cleanForSave first. */
const clusterReplace = () => withApi('CLUSTER REPLACE', async(api) => {
  const id = `${ NS }/${ PROBE_CM }`;
  const current = await api.cluster.find(RESOURCE_TYPES.CONFIG_MAP, id);

  current.data = { probe: 'v3' };

  await api.cluster.replace(RESOURCE_TYPES.CONFIG_MAP, id, current);

  const after = await api.cluster.find(RESOURCE_TYPES.CONFIG_MAP, id);

  return `CLUSTER REPLACE OK: ${ after?.data?.probe }`;
});

const clusterDelete = () => withApi('CLUSTER DELETE', async(api) => {
  const id = `${ NS }/${ PROBE_CM }`;

  await api.cluster.delete(RESOURCE_TYPES.CONFIG_MAP, id);

  let gone = false;

  try {
    const after = await api.cluster.find(RESOURCE_TYPES.CONFIG_MAP, id);

    gone = !after;
  } catch {
    // find() throwing a 404 is also proof it was removed.
    gone = true;
  }

  return `CLUSTER DELETE OK: ${ gone }`;
});

/** Whole lifecycle in one click, so the suite can assert CRUD without ordering between tests. */
const clusterCrud = () => withApi('CLUSTER CRUD', async(api) => {
  const id = `${ NS }/${ PROBE_CM }`;

  try {
    await api.cluster.delete(RESOURCE_TYPES.CONFIG_MAP, id);
  } catch {}

  await api.cluster.create({
    type: RESOURCE_TYPES.CONFIG_MAP, metadata: { name: PROBE_CM, namespace: NS }, data: { probe: 'v1' }
  });
  await api.cluster.update(RESOURCE_TYPES.CONFIG_MAP, id, { data: { probe: 'v2' } });

  const patched = await api.cluster.find(RESOURCE_TYPES.CONFIG_MAP, id);

  patched.data = { probe: 'v3' };
  await api.cluster.replace(RESOURCE_TYPES.CONFIG_MAP, id, patched);

  const replaced = await api.cluster.find(RESOURCE_TYPES.CONFIG_MAP, id);

  await api.cluster.delete(RESOURCE_TYPES.CONFIG_MAP, id);

  return `CLUSTER CRUD OK: ${ replaced?.data?.probe }`;
});

// ── MgmtApi ─────────────────────────────────────────────────────────────────────────

const mgmtFind = () => withApi('MGMT FIND', async(api) => {
  const setting = await api.mgmt.find(RESOURCE_TYPES.SETTING, 'server-url');

  return `MGMT FIND OK: ${ setting?.id }`;
});

const mgmtFindAll = () => withApi('MGMT FINDALL', async(api) => {
  const clusters = await api.mgmt.findAll(RESOURCE_TYPES.MGMT_CLUSTER);

  return `MGMT FINDALL OK: ${ (clusters || []).some((c: any) => c.id === 'local') }`;
});

const mgmtFindFilteredTransient = () => withApi('MGMT FINDFILTERED TRANSIENT', async(api) => {
  const page = await api.mgmt.findFiltered(RESOURCE_TYPES.MGMT_CLUSTER, {
    transient:  true,
    pagination: {
      page: 1, pageSize: 1, filters: [], sort: []
    }
  });

  return `MGMT FINDFILTERED TRANSIENT OK: ${ page?.data?.length }`;
});

const mgmtFindFilteredPage = () => withApi('MGMT FINDFILTERED PAGE', async(api) => {
  const clusters = await api.mgmt.findFiltered(RESOURCE_TYPES.MGMT_CLUSTER, {
    pagination: {
      page: 1, pageSize: 1, filters: [], sort: []
    }
  });

  return `MGMT FINDFILTERED PAGE OK: ${ Array.isArray(clusters) && clusters.length <= 1 }`;
});

const mgmtFindFilteredLabel = () => withApi('MGMT FINDFILTERED LABEL', async(api) => {
  const res = await api.mgmt.findFiltered(RESOURCE_TYPES.MGMT_CLUSTER, { labelSelector: { matchLabels: { 'ext-compat': 'probe' } } });
  const list = Array.isArray(res) ? res : (res?.data ?? []);

  return `MGMT FINDFILTERED LABEL OK: ${ Array.isArray(list) }`;
});

/**
 * Management-scoped write lifecycle: create -> update -> replace -> delete.
 *
 * Target is a management.cattle.io.setting named by the probe. Settings are plain CRs and the
 * Settings UI creates them through the same path, but this is the one probe whose write target
 * is not exercised elsewhere in the suite - if a Rancher version rejects it, this reports FAILED
 * with the server message rather than silently passing.
 */
const mgmtCrud = () => withApi('MGMT CRUD', async(api) => {
  try {
    await api.mgmt.delete(RESOURCE_TYPES.SETTING, PROBE_SETTING);
  } catch {}

  await api.mgmt.create({
    type: RESOURCE_TYPES.SETTING, metadata: { name: PROBE_SETTING }, value: 'v1'
  });
  await api.mgmt.update(RESOURCE_TYPES.SETTING, PROBE_SETTING, { value: 'v2' });

  const patched = await api.mgmt.find(RESOURCE_TYPES.SETTING, PROBE_SETTING);

  patched.value = 'v3';
  await api.mgmt.replace(RESOURCE_TYPES.SETTING, PROBE_SETTING, patched);

  const replaced = await api.mgmt.find(RESOURCE_TYPES.SETTING, PROBE_SETTING);

  await api.mgmt.delete(RESOURCE_TYPES.SETTING, PROBE_SETTING);

  return `MGMT CRUD OK: ${ replaced?.value }`;
});

const probes = [
  { id: 'cluster-create', label: 'Cluster create', fn: clusterCreate },
  { id: 'cluster-find', label: 'Cluster find', fn: clusterFind },
  { id: 'cluster-find-all', label: 'Cluster findAll', fn: clusterFindAll },
  { id: 'cluster-find-all-opts', label: 'Cluster findAll (options)', fn: clusterFindAllOpts },
  { id: 'cluster-find-filtered-transient', label: 'Cluster findFiltered (transient)', fn: clusterFindFilteredTransient },
  { id: 'cluster-find-filtered-page', label: 'Cluster findFiltered (page)', fn: clusterFindFilteredPage },
  { id: 'cluster-find-filtered-label', label: 'Cluster findFiltered (labelSelector)', fn: clusterFindFilteredLabel },
  { id: 'cluster-update', label: 'Cluster update', fn: clusterUpdate },
  { id: 'cluster-replace', label: 'Cluster replace', fn: clusterReplace },
  { id: 'cluster-delete', label: 'Cluster delete', fn: clusterDelete },
  { id: 'cluster-crud', label: 'Cluster full CRUD', fn: clusterCrud },
  { id: 'mgmt-find', label: 'Mgmt find', fn: mgmtFind },
  { id: 'mgmt-find-all', label: 'Mgmt findAll', fn: mgmtFindAll },
  { id: 'mgmt-find-filtered-transient', label: 'Mgmt findFiltered (transient)', fn: mgmtFindFilteredTransient },
  { id: 'mgmt-find-filtered-page', label: 'Mgmt findFiltered (page)', fn: mgmtFindFilteredPage },
  { id: 'mgmt-find-filtered-label', label: 'Mgmt findFiltered (labelSelector)', fn: mgmtFindFilteredLabel },
  { id: 'mgmt-crud', label: 'Mgmt full CRUD', fn: mgmtCrud },
];
</script>

<template>
  <div>
    <h2>Resources API Demo</h2>
    <p>Compatibility probes for the Resources API (Rancher 2.15 and later).</p>

    <p class="mt-20 mb-20">
      <code data-testid="resources-api-availability">{{ availability }}</code>
    </p>

    <div class="probe-grid">
      <RcButton
        v-for="probe in probes"
        :key="probe.id"
        primary
        :data-testid="`resources-api-${ probe.id }`"
        @click="probe.fn"
      >
        {{ probe.label }}
      </RcButton>
    </div>

    <a
      class="mb-20"
      href="https://extensions.rancher.io/extensions/next/resources-api/interfaces/ClusterApi"
      target="_blank"
      rel="noopener noreferrer"
    >Documentation Reference</a>

    <p class="mt-40 mb-20">Resources API result:</p>
    <code data-testid="resources-api-result">{{ result }}</code>
  </div>
</template>

<style lang="scss" scoped>
.probe-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}
</style>
