import { ELEMENTAL_PRODUCT_NAME } from '../config/elemental-types';
import Dashboard from '../pages/index.vue';
import ElementalCustomListView from '../pages/_resource/index.vue';
import ShellResourceCreate from '@shell/pages/c/_cluster/_product/_resource/create.vue';
import ShellResourceDetails from '@shell/pages/c/_cluster/_product/_resource/_id.vue';
import ShellResourceDetailsNamespaced from '@shell/pages/c/_cluster/_product/_resource/_namespace/_id.vue';

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
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource`,
    component: ElementalCustomListView,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-create`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource/create`,
    component: ShellResourceCreate,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-id`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource/:id`,
    component: ShellResourceDetails,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
  {
    name:      `${ ELEMENTAL_PRODUCT_NAME }-c-cluster-resource-namespace-id`,
    path:      `/${ ELEMENTAL_PRODUCT_NAME }/c/:cluster/:resource/:namespace/:id`,
    component: ShellResourceDetailsNamespaced,
    meta:      {
      product: ELEMENTAL_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     ELEMENTAL_PRODUCT_NAME
    }
  },
];

export default routes;
