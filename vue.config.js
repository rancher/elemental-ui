// const config = require('@rancher/shell/vue.config'); // eslint-disable-line @typescript-eslint/no-var-requires

// module.exports = config(__dirname, {
//   excludes: [],
//   // excludes: ['fleet', 'example']
// });

const config = require('@rancher/shell/vue.config');
const configHelper = require('@rancher/shell/vue-config-helper.js');

console.log('API ON ELEMENTAL', configHelper.api)

module.exports = config(__dirname, {
  excludes: [],
  proxies:  { '/elemental': configHelper.proxyOpts(configHelper.api) }
});
