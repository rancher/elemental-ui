import { PRODUCT_NAME } from '../config/types';

const BLANK_CLUSTER = '_';

export const rootDesktopRoute = () => ({
  name:    `${ PRODUCT_NAME }-c-cluster`,
  params: { product: PRODUCT_NAME, cluster: BLANK_CLUSTER },
  meta:   {
    product: PRODUCT_NAME,
    cluster: BLANK_CLUSTER,
    pkg:     PRODUCT_NAME
  },
});

export const createDesktopRoute = (name: string, params?: Object, meta?: Object) => ({
  name:   `${ rootDesktopRoute().name }-${ name }`,
  params: {
    ...rootDesktopRoute().params,
    ...params
  },
  meta: {
    ...rootDesktopRoute().meta,
    ...meta
  }
});
