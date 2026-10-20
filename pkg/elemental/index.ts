import { importTypes } from '@rancher/auto-import';
import { IPlugin, ActionLocation, TabLocation, ActionOpts, PanelLocation, CardLocation, TableColumnLocation, TableLocation} from '@shell/core/types';
import { STATE, NAME as NAME_COL, AGE } from '@shell/config/table-headers';
import elementalRouting from './routing/elemental-routing';
import elementalStore from './store/elemental-store';
import { ELEMENTAL_SCHEMA_IDS } from './config/elemental-types';

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

  // SECOND PANEL ABOVE LIST VIEW -> compatibility probe for rancher/dashboard#18635.
  // ExtensionPanel renders every matching panel, so this stacks under the banner above without
  // disturbing it. It puts an extension-bundled component that calls useRoute() on a host page,
  // which is the path that broke on Rancher versions without window.__vueRouter.
  $plugin.addPanel(
    PanelLocation.RESOURCE_LIST,
    { resource: ['catalog.cattle.io.clusterrepo'] },
    { component: () => import('./components/apis-components/UseRouteProbeComponent.vue') }); // component to be rendered

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

  // MODEL EXTENSION -> compatibility probe for rancher/dashboard#18633.
  // Exercises steve-class.js -> modelExtensions -> $extension.getDynamic(...), one of the unguarded
  // root state reads. Read back through the modelExtensionCheck getter on the machineinventory
  // model, which is surfaced as a column on the Inventory of Machines list.
  $plugin.addModelExtension(
    ELEMENTAL_SCHEMA_IDS.MACHINE_INVENTORIES,
    class ElementalDemoModelExtension {
      context: any;

      constructor(context: any) {
        this.context = context;
      }

      useFor(resource: any) {
        return !!resource;
      }

      get label() {
        return 'MODEL EXTENSION OK';
      }
    }
  );

  // PLUGIN VALIDATOR -> compatibility probe for rancher/dashboard#18633.
  // Exercises resource-class.js -> this.$rootState.$extension?.getValidator(). That read is
  // optional chained, so a host mismatch fails silently rather than throwing. Read back through the
  // pluginValidatorCheck getter on the machineinventory model.
  $plugin.validators = {
    elementalDemoValidator(value: any, getters: any, errors: string[]) {
      errors.push('PLUGIN VALIDATOR OK');
    }
  };

  // PRODUCT REGISTRATION API -> compatibility probe for the Product Registration API (Rancher 2.15+).
  //
  // Registered as a SEPARATE product rather than by converting the existing Elemental product:
  // addProduct is once-per-product-name, the Elemental product is still the legacy DSL in
  // elemental-config.js, and the existing compatibility tests navigate by its exact nav labels.
  // Keeping this additive means the new probes cannot regress Test Group 8.
  //
  // `$plugin` is cast to any on purpose. This extension is rebuilt against the shell of every
  // Rancher version in the compatibility matrix, and on pre-2.15 shells these methods are absent
  // from IPlugin - typing against them would fail the build rather than degrade.
  const plugin = $plugin as any;

  // extendProduct only exists from 2.15, so it doubles as the feature detect for the whole API.
  if (typeof plugin.extendProduct === 'function') {
    // ---------------------------------------------------------------------------------------
    // 1. Full product: custom page, resource page, groups with and without an overview, a group
    //    with an explicit default child, and enable-gated pages.
    // ---------------------------------------------------------------------------------------
    plugin.addProduct(
      {
        name:      'elemental-compat',
        label:     'Elemental Compat',
        sideBar:   { icon: { name: 'gear' }, weight: 1 },
        appHeader: { showClusterInfo: false },
        resources: { hideSystemResources: true }
      },
      [
        // --- plain custom page (landing route: first item after weight ordering) ---
        {
          name:      'compat-overview',
          label:     'Compat Overview',
          component: () => import('./pages/prodRegOverview.vue'),
          sideMenu:  { weight: 100 }
        },

        // --- resource page: generated list/detail/edit + list config ---
        // provisioning.cattle.io.cluster always has at least the `local` row on the test host,
        // so the generated list is never empty.
        {
          type:       'provisioning.cattle.io.cluster',
          label:      'Compat Clusters',
          can:        {
            create: false, edit: false, remove: false, yaml: true
          },
          display:    { showState: true, showAge: true },
          views:      { list: { showListMasthead: false } },
          listConfig: {
            hideBulkActions: true,
            localHeaders:    [
              STATE,
              NAME_COL,
              {
                name:     'prodRegProbe',
                label:    'ProdReg Probe',
                getValue: () => 'PRODREG COLUMN OK'
              },
              AGE
            ]
          },
          sideMenu: { weight: 90 }
        },

        // --- group WITHOUT a component: a plain collapsible folder, no overview route ---
        {
          name:     'compat-group-plain',
          label:    'Compat Group Plain',
          sideMenu: {
            weight:   80,
            children: [
              {
                name: 'compat-child-a', label: 'Compat Child A', component: () => import('./pages/prodRegChildA.vue')
              },
              {
                name: 'compat-child-b', label: 'Compat Child B', component: () => import('./pages/prodRegChildB.vue')
              }
            ]
          }
        },

        // --- group WITH a component + enableOverviewPage: the header itself is a route ---
        {
          name:               'compat-group-overview',
          label:              'Compat Group Overview',
          component:          () => import('./pages/prodRegGroupOverview.vue'),
          enableOverviewPage: { ifHaveType: 'provisioning.cattle.io.cluster' },
          sideMenu:           {
            weight:   70,
            children: [{ type: 'management.cattle.io.cluster', label: 'Compat Mgmt Clusters' }]
          }
        },

        // --- group with an explicit default child: clicking the header opens the 2nd child ---
        {
          name:     'compat-group-default',
          label:    'Compat Group Default',
          sideMenu: {
            weight:   60,
            default:  'compat-default-target',
            children: [
              {
                name: 'compat-default-sibling', label: 'Compat Default Sibling', component: () => import('./pages/prodRegGroupDefaultSibling.vue')
              },
              {
                name: 'compat-default-target', label: 'Compat Default Target', component: () => import('./pages/prodRegGroupDefault.vue')
              }
            ]
          }
        },

        // --- enable gating: this one's condition holds, so the entry renders ---
        {
          name:      'compat-gated-visible',
          label:     'Compat Gated Visible',
          component: () => import('./pages/prodRegGatedVisible.vue'),
          enable:    { ifHaveType: 'provisioning.cattle.io.cluster' },
          sideMenu:  { weight: 50 }
        },

        // --- enable gating: condition cannot hold, so the entry must NEVER render ---
        {
          name:      'compat-gated-hidden',
          label:     'Compat Gated Hidden',
          component: () => import('./pages/prodRegGatedHidden.vue'),
          enable:    { ifHaveType: 'elemental.compat.does.not.exist' },
          sideMenu:  { weight: 40 }
        }
      ]
    );

    // ---------------------------------------------------------------------------------------
    // 2. Single-page product: one component, no side menu.
    // ---------------------------------------------------------------------------------------
    plugin.addProduct({
      name:      'elemental-compat-single',
      label:     'Elemental Compat Single',
      sideBar:   { icon: { name: 'globe' }, weight: 2 },
      component: () => import('./pages/prodRegSinglePage.vue')
    });

    // ---------------------------------------------------------------------------------------
    // 3. Name-only convenience overload: registers a product with a default empty page.
    // ---------------------------------------------------------------------------------------
    plugin.addProduct('elemental-compat-minimal');

    // ---------------------------------------------------------------------------------------
    // 4. Extending two different built-in products.
    // ---------------------------------------------------------------------------------------
    plugin.extendProduct('explorer', [
      {
        name:      'elemental-compat-explorer',
        label:     'Elemental Compat Explorer Page',
        component: () => import('./pages/prodRegExtendExplorer.vue')
      }
    ]);

    plugin.extendProduct('manager', [
      {
        name:      'elemental-compat-manager',
        label:     'Elemental Compat Manager Page',
        component: () => import('./pages/prodRegExtendManager.vue')
      }
    ]);
  }
}
