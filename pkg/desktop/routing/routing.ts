import { PRODUCT_NAME } from '../config/types';
import Desktop from '../pages/desktop.vue';
import General from '../pages/general.vue';
import PortForwarding from '../pages/port-forwarding.vue';
import Images from '../pages/images.vue';
import ListElementalResource from '../pages/_resource/index.vue';
import CreateElementalResource from '../pages/_resource/create.vue';
import ElementalResourceDetails from '../pages/_resource/_id.vue';

const BLANK_CLUSTER = '_';

const routes = [
  {
    name:      `${ PRODUCT_NAME }-c-cluster`,
    path:      `/${ PRODUCT_NAME }/c/:cluster/desktop`,
    component: Desktop,
    meta:      {
      product: PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     PRODUCT_NAME
    },
    children:  [
      {
        name:      `${ PRODUCT_NAME }-c-cluster-general`,
        path:      `/${ PRODUCT_NAME }/c/:cluster/general`,
        component: General,
         meta:      {
          product: PRODUCT_NAME,
          cluster: BLANK_CLUSTER,
          pkg:     PRODUCT_NAME
        },
      },
      {
        name:      `${ PRODUCT_NAME }-c-cluster-portforwarding`,
        path:      `/${ PRODUCT_NAME }/c/:cluster/portforwarding`,
        component: PortForwarding,
         meta:      {
          product: PRODUCT_NAME,
          cluster: BLANK_CLUSTER,
          pkg:     PRODUCT_NAME
        },
      },
      {
        name:      `${ PRODUCT_NAME }-c-cluster-images`,
        path:      `/${ PRODUCT_NAME }/c/:cluster/images`,
        component: Images,
         meta:      {
          product: PRODUCT_NAME,
          cluster: BLANK_CLUSTER,
          pkg:     PRODUCT_NAME
        },
      },
    ],
  },
  // {
  //   name:      `${ PRODUCT_NAME }-c-cluster-page1`,
  //   path:      `/${ PRODUCT_NAME }/c/:cluster/page1`,
  //   component: Dashboard,
  //   meta:      {
  //     product: PRODUCT_NAME,
  //     cluster: BLANK_CLUSTER,
  //     pkg:     PRODUCT_NAME
  //   }
  // },
  // {
  //   name:      `${ PRODUCT_NAME }-c-cluster-resource`,
  //   path:      `/${ PRODUCT_NAME }/c/:cluster/:resource`,
  //   component: ListElementalResource,
  //   meta:      {
  //     product: PRODUCT_NAME,
  //     cluster: BLANK_CLUSTER,
  //     pkg:     PRODUCT_NAME
  //   }
  // },
  // {
  //   name:      `${ PRODUCT_NAME }-c-cluster-resource-create`,
  //   path:      `/${ PRODUCT_NAME }/c/:cluster/:resource/create`,
  //   component: CreateElementalResource,
  //   meta:      {
  //     product: PRODUCT_NAME,
  //     cluster: BLANK_CLUSTER,
  //     pkg:     PRODUCT_NAME
  //   }
  // },
  // {
  //   name:      `${ PRODUCT_NAME }-c-cluster-resource-id`,
  //   path:      `/${ PRODUCT_NAME }/c/:cluster/:resource/:id`,
  //   component: ElementalResourceDetails,
  //   meta:      {
  //     product: PRODUCT_NAME,
  //     cluster: BLANK_CLUSTER,
  //     pkg:     PRODUCT_NAME
  //   }
  // },
  // {
  //   name:      `${ PRODUCT_NAME }-c-cluster-resource-namespace-id`,
  //   path:      `/${ PRODUCT_NAME }/c/:cluster/:resource/:namespace/:id`,
  //   component: ElementalResourceDetails,
  //   meta:      {
  //     product: PRODUCT_NAME,
  //     cluster: BLANK_CLUSTER,
  //     pkg:     PRODUCT_NAME
  //   }
  // },
];

export default routes;
