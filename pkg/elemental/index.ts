import { importTypes } from '@rancher/auto-import';
import { IPlugin, ActionLocation, TabLocation, ActionOpts, PanelLocation, CardLocation, TableColumnLocation, TableLocation} from '@shell/core/types';
import elementalRouting from './routing/elemental-routing';
import elementalStore from './store/elemental-store';

// Init the package
export default function($plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes($plugin);

  // Provide plugin metadata from package.json
  $plugin.metadata = require('./package.json');

  // Load a product
  $plugin.addProduct(require('./elemental-config'));

  // Add Vuex store
  $plugin.addDashboardStore(elementalStore.config.namespace, elementalStore.specifics, elementalStore.config);

  // Add Vue Routes
  $plugin.addRoutes(elementalRouting);

  // HEADER ACTION - GLOBAL
  $plugin.addAction(
    ActionLocation.HEADER,
    {},
    {
      label: 'action-one',
      tooltipKey: 'plugin-examples.header-action-one',
      tooltip: 'Test Action1',
      shortcut: 'm',
      icon: 'icon-pipeline',
      invoke(opts: any, resources: any) {
        console.log('action executed 1', this); // eslint-disable-line no-console
        console.log(opts); // eslint-disable-line no-console
        console.log(resources); // eslint-disable-line no-console
      }
    }
  );

  // HEADER ACTION - BOUND TO A PRODUCT
  $plugin.addAction(
    ActionLocation.HEADER,
    { product: ['explorer'] },
    {
      label: 'action-two',
      tooltipKey: 'plugin-examples.header-action-two',
      tooltip: 'Test Action2',
      shortcut: 'b',
      icon: 'icon-rancher-desktop',
      enabled(ctx: any) {
        return true;
      },
      invoke(opts: any, resources: any) {
        console.log('action executed 2', this); // eslint-disable-line no-console
        console.log(opts); // eslint-disable-line no-console
        console.log(resources); // eslint-disable-line no-console
      }
    }
  );


  // ADDS TAB to Resource Detail Page
  // NEW TabLocation - introduced in Rancher 2.14+ 
  // https://extensions.rancher.io/extensions/next/api/tabs
  $plugin.addTab(
    TabLocation.RESOURCE_DETAIL_PAGE,
    { resource: ['service'] },
    {
      name:       'detail-page-id',
      label:      'detail-page-label',
      weight:     -5,
      showHeader: true,
      tooltip:    'this is a tooltip message',
      component:  () => import('./components/apis-components/MyTabComponent.vue')
    }
  );

  // ADDS TAB to Resource Create Page
  // NEW TabLocation - introduced in Rancher 2.14+
  // https://extensions.rancher.io/extensions/next/api/tabs
  $plugin.addTab(
    TabLocation.RESOURCE_CREATE_PAGE,
    { resource: ['service'] },
    {
      name:       'create-page-id',
      label:      'create-page-label',
      weight:     -5,
      showHeader: true,
      tooltip:    'this is a tooltip message',
      component:  () => import('./components/apis-components/MyTabComponent.vue')
    }
  );

  // ADDS TAB to Resource Edit Page
  // NEW TabLocation - introduced in Rancher 2.14+
  // https://extensions.rancher.io/extensions/next/api/tabs
  $plugin.addTab(
    TabLocation.RESOURCE_EDIT_PAGE,
    { resource: ['service'] },
    {
      name:       'edit-page-id',
      label:      'edit-page-label',
      weight:     -5,
      showHeader: true,
      tooltip:    'this is a tooltip message',
      component:  () => import('./components/apis-components/MyTabComponent.vue')
    }
  );

  // ADDS TAB to Resource Show Configuration Slide-in panel
  // NEW TabLocation - introduced in Rancher 2.14+
  // https://extensions.rancher.io/extensions/next/api/tabs
  $plugin.addTab( 
    TabLocation.RESOURCE_SHOW_CONFIGURATION,
    { resource: ['service'] }, 
    {
      name:       'show-configuration-id',
      label:      'show-configuration-label',
      weight:     -5,
      showHeader: true,
      tooltip:    'this is a tooltip message',
      component:  () => import('./components/apis-components/MyTabComponent.vue')
    }
  );

  // ADDS TAB to cluster creation RKE2
  // NEW TabLocation - introduced in Rancher 2.14+
  // https://extensions.rancher.io/extensions/next/api/tabs
  $plugin.addTab( 
  TabLocation.CLUSTER_CREATE_RKE2,
    {}, 
    {
      name:       'cluster-create-rke2-id',
      label:      'cluster-create-rke2-label',
      weight:     -5,
      showHeader: true,
      tooltip:    'this is a tooltip message',
      component:  () => import('./components/apis-components/MyTabComponent.vue')
    }
  );

  // TODO TEST CASE... NOT WORKING!!!!!
  // ADDS TAB to OTHER location
  // NEW TabLocation - introduced in Rancher 2.14+
  // https://extensions.rancher.io/extensions/next/api/tabs
  $plugin.addTab( 
    TabLocation.OTHER,
    { resource: ['pod'], mode: ['create']}, 
    {
      name:       'pod-create-id',
      label:      'pod-create-label',
      weight:     -5,
      showHeader: true,
      tooltip:    'this is a tooltip message',
      component:  () => import('./components/apis-components/MyTabComponent.vue')
    }
  );
  
  // ADDS TAB TO "ResourceTabs" COMPONENT
  // LEGACY TabLocation - to be deprecated in future versions of Rancher from 2.14+
  $plugin.addTab(
    TabLocation.RESOURCE_DETAIL,
    { resource: ['pod'] },
    {
      name: 'pod-detail-id',
      label: 'pod-detail-label',
      weight: -5,
      showHeader: true,
      tooltip: 'this is a tooltip message',
      component: () => import('./components/apis-components/MyTabComponent.vue')
    }
  );

  // TABLE ACTIONS - ROW ACTION
  $plugin.addAction(
    ActionLocation.TABLE,
    { resource: ['catalog.cattle.io.clusterrepo'] },
    {
      label: 'some-extension-action',
      labelKey: 'plugin-examples.table-action-one',
      icon: 'icon-pipeline',
      invoke(opts: ActionOpts, values: any[]) {
        console.log('table action executed 1', this, opts, values); // eslint-disable-line no-console
      }
    }
  );

  // TABLE ACTIONS - ROW + BULKABLE
  $plugin.addAction(
    ActionLocation.TABLE,
    { resource: ['catalog.cattle.io.clusterrepo'] },
    {
      label: 'some-bulkable-action',
      labelKey: 'plugin-examples.table-action-two',
      icon: 'icon-rancher-desktop',
      multiple: true,
      invoke(opts: ActionOpts, values: any[]) {
        console.log('table action executed 2', this); // eslint-disable-line no-console
        console.log(opts); // eslint-disable-line no-console
        console.log(values); // eslint-disable-line no-console
      },
    }
  );

  // DETAILS VIEW MASTHEAD DATA
  $plugin.addPanel(
    PanelLocation.DETAILS_MASTHEAD,
    { resource: ['catalog.cattle.io.clusterrepo'] },
    { component: () => import('./components/apis-components/MastheadDetailsComponent.vue') }); // component to be rendered

  // DETAILS VIEW MASTHEAD DATA - EDIT VIEW
  $plugin.addPanel(
    PanelLocation.DETAILS_MASTHEAD,
    { resource: ['catalog.cattle.io.clusterrepo'], mode: ['edit'] },
    { component: () => import('./components/apis-components/MastheadDetailsComponentEdit.vue') }); // component to be rendered

  // DETAILS VIEW "DetailTop" DATA
  $plugin.addPanel(
    PanelLocation.DETAIL_TOP,
    { resource: ['catalog.cattle.io.clusterrepo'] },
    { component: () => import('./components/apis-components/DetailTopComponent.vue') }); // component to be rendered

  // DATA ABOVE LIST VIEW
  $plugin.addPanel(
    PanelLocation.RESOURCE_LIST,
    { resource: ['catalog.cattle.io.clusterrepo'] },
    { component: () => import('./components/apis-components/BannerComponent.vue') }); // component to be rendered

  // PANEL in ABOUT PAGE
  $plugin.addPanel(
    PanelLocation.ABOUT_TOP,
    {},
    { component: () => import('./components/apis-components/BannerComponent.vue') }); // component to be rendered

  // CLUSTER DASHBOARD CARD
  $plugin.addCard(
    CardLocation.CLUSTER_DASHBOARD_CARD,
    { cluster: ['local'] },
    {
      label: 'some-card',
      labelKey: 'plugin-examples.card-title-one',
      component: () => import('./components/apis-components/MastheadDetailsComponent.vue')
    }
  );

  // Create a column that shows in the configmap and secret tables
  $plugin.addTableColumn(
    TableColumnLocation.RESOURCE,
    { resource: ['secret'] },
    { // Column definition used when server-side pagination is DISABLED and ENABLED
      name: 'column-example-1-basic',
      weight: 2, // rancher 2.14 property to influence column ordering - https://extensions.rancher.io/extensions/next/api/tabs
      labelKey: 'plugin-examples.table.col-example-1-basic',
      sort: 'id', // Works for both server-side pagination disabled (path on the local instance of the resource) and disabled (path on the server-side instance of the resource)
      search: 'id', // As per sort, this is a path on the local and server-side instance of the resource
      formatter: 'DemoFormatter', // This is used to format the value for display in the cell, it does not impact what is used for sorting and searching
      getValue: (row: any) => {
        return `Custom Cell Value 1`;
      },
    }
  );

  // Create a column that shows in the pods table. It will present the value of a label ('extension-label) which can be sorted/searched on
  // when server-side pagination is enabled or disabled
  $plugin.addTableColumn(
    TableColumnLocation.RESOURCE,
    { resource: ['configmap'] },
    { // Column definition used when server-side pagination is DISABLED
      name: 'column-example-2-basic',
      labelKey: 'plugin-examples.table.col-example-2-basic',
      getValue: (row: any) => {
        // This text can be constructed locally in the browser and usable by local sort + search
        // return row.metadata.labels["extension-label"] || 'empty';
        return `Custom Cell Value 2`;
      },
    },
    { // Column definition used when server-side pagination is ENABLED
      name: 'column-example-2-pagination',
      labelKey: 'plugin-examples.table.col-example-2-pagination',
      // value, sort and search all must be a path to a property in the resource, they cannot be computed locally.
      value: 'metadata.name',
      sort: 'metadata.name',
      search: 'metadata.name',
    }
  );

  // TABLE HOOK EXAMPLE -> compatible with rancher 2.14 and later
  // https://extensions.rancher.io/extensions/next/api/table
  $plugin.addTableHook(
    TableLocation.RESOURCE,
    { resource: ['pod'] },
    {
      tableHook: (arg: any) => {
        console.error('TABLE HOOK TRIGGERED', arg);
      }
    }
  );
}
