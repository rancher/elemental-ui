import { ELEMENTAL_PRODUCT_NAME } from '../config/elemental-types';

const BLANK_CLUSTER = '_';

export const rootElementalRoute = () => ({
  name:    `${ ELEMENTAL_PRODUCT_NAME }-c-cluster`,
  params: { product: ELEMENTAL_PRODUCT_NAME, cluster: BLANK_CLUSTER },
  meta:   {
    product: ELEMENTAL_PRODUCT_NAME,
    cluster: BLANK_CLUSTER,
    pkg:     ELEMENTAL_PRODUCT_NAME
  },
});

export const createElementalRoute = (name: string, params: Object, meta: Object) => ({
  name:   `${ rootElementalRoute().name }-${ name }`,
  params: {
    ...rootElementalRoute().params,
    ...params
  },
  meta: {
    ...rootElementalRoute().meta,
    ...meta
  }
});
