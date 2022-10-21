import config, { API_PATH, proxyOpts } from '@rancher/shell/nuxt.config';

export default config(__dirname, {
  excludes:   [],
  autoImport: [],
  proxies: {
    '/elemental/registration': proxyOpts(API_PATH)
  }
});
