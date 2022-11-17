import { ELEMENTAL_PRODUCT_NAME } from '../config/elemental-types';

const BLANK_CLUSTER = '_';

export const rootElementalRoute = () => ({
  name:    `c-cluster-product`,
  params: { product: ELEMENTAL_PRODUCT_NAME, cluster: BLANK_CLUSTER }
});

export const createElementalRoute = (name: string, params: Object) => ({
  name:   `${ rootElementalRoute().name }-${ name }`,
  params: {
    ...rootElementalRoute().params,
    ...params
  }
});
