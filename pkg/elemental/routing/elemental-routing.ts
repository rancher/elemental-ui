import { ELEMENTAL_PRODUCT_NAME } from '../config/elemental-types';
import Dashboard from '../pages/index.vue';
import ListElementalResource from '../pages/_resource/index.vue';
import CreateElementalResource from '../pages/_resource/create.vue';
import ElementalResourceDetails from '../pages/_resource/_id.vue';
import ShellApiDemoPage from '../pages/shellApiDemo.vue';
import ResourcesApiDemoPage from '../pages/resourcesApiDemo.vue';

const BLANK_CLUSTER = '_';

const routes = [
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/dashboard`,
    component: Dashboard,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
  // this covers the shell API demo page
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-shell-api-demo`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/shell-api-demo`,
    component: ShellApiDemoPage,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    },
  },
  // this covers the Resources API demo page (compatibility probe, Rancher 2.15+)
  // Must stay above the `:resource` catch-all below, otherwise it is swallowed by it.
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resources-api-demo`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/resources-api-demo`,
    component: ResourcesApiDemoPage,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    },
  },
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource`,
    component: ListElementalResource,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-create`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource/create`,
    component: CreateElementalResource,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-id`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource/:id`,
    component: ElementalResourceDetails,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-namespace-id`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource/:namespace/:id`,
    component: ElementalResourceDetails,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
];

export default routes;
