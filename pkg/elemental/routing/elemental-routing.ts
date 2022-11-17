import Dashboard from '../pages/index.vue';
import ListElementalResource from '../pages/_resource/index.vue';
import CreateElementalResource from '../pages/_resource/create.vue';
import ElementalResourceDetails from '../pages/_resource/_id.vue';

const routes = [
  {
    name:      `c-cluster-product`,
    path:      `/c/:cluster/:product/dashboard`,
    component: Dashboard,
  },
  {
    name:      `c-cluster-product-resource`,
    path:      `/c/:cluster/:product/:resource`,
    component: ListElementalResource,
  },
  {
    name:      `c-cluster-product-resource-create`,
    path:      `/c/:cluster/:product/:resource/create`,
    component: CreateElementalResource,
  },
  {
    name:      `c-cluster-product-resource-id`,
    path:      `/c/:cluster/:product/:resource/id`,
    component: ElementalResourceDetails,
  },
];

export default routes;
