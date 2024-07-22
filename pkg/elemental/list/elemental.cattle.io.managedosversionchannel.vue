<script>
import ResourceTable from '@shell/components/ResourceTable';
// import ResourceFetch from '@shell/mixins/resource-fetch';
import Loading from '@shell/components/Loading';

export default {
  name:       'ListPersistentVolume',
  components: { Loading, ResourceTable },
  props:      {
    resource: {
      type:     String,
      required: true,
    },

    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    await this.$store.dispatch('management/findAll', { type: this.resource });
  },
  data() {
    return {
      rawChannelsData: [
        {
          baseOS:        'SLE Micro',
          baseOSVersion: '5.5',
          defaultName:   'sle-micro-5-5',
          description:   'Default channel that can be used for any generic workload.',
          uri:           'registry.opensuse.org/isv/rancher/elemental/dev/containers/rancher/elemental-channel/sle-micro:5.5'
        },
        {
          baseOS:        'SLE Micro',
          baseOSVersion: '5.5',
          defaultName:   'sle-micro-5-5-kvm',
          description:   'Ready to be used with KVM. Contains QEMU Guest agent by default.',
          flavor:        'KVM',
          uri:           'registry.opensuse.org/isv/rancher/elemental/dev/containers/rancher/elemental-channel/sle-micro:5.5-kvm'
        },
        {
          baseOS:        'SLE Micro',
          baseOSVersion: '5.5',
          defaultName:   'sle-micro-5-5-rt',
          description:   'Channel that can be used for any generic workload with a Real-Time kernel.',
          flavor:        'RT',
          uri:           'registry.opensuse.org/isv/rancher/elemental/dev/containers/rancher/elemental-channel/sle-micro:5.5-rt'
        }
      ],
      headers: [
        {
          name:     'state',
          labelKey: 'tableHeaders.state',
          sort:     [
            'stateSort',
            'nameSort'
          ],
          width:     100,
          default:   'unknown',
          formatter: 'BadgeStateFormatter',
          value:     'stateDisplay',
        },
        {
          name:     'name',
          labelKey: 'tableHeaders.name',
          sort:     [
            'nameSort'
          ],
          formatter:     'LinkDetail',
          canBeVariable: true,
          value:         'nameDisplay',
        },
        {
          name:      'toggleSwitchFormatter',
          value:     'toggleSwitchData',
          label:     'Enabled',
          width:     100,
          formatter: 'ToggleSwitchFormatter',
        },
        {
          name:     'ChannelImage',
          labelKey: 'tableHeaders.channelImage',
          value:         'imagePath',
          sort:     [
            'imagePath'
          ]
        },
        {
          name:      'age',
          labelKey:  'tableHeaders.age',
          sort:      'creationTimestamp:desc',
          search:    false,
          formatter: 'LiveDate',
          width:     100,
          align:     'left',
          value:     'creationTimestamp'
        }
      ]
    };
  },

  computed: {
    rows() {
      const rows = Object.assign([], this.$store.getters['management/all'](this.resource));
      const channelsFromMetadata = Object.assign([], this.channelsDataConversion(this.rawChannelsData));

      console.log('rows', rows.concat(channelsFromMetadata));

      return rows.concat(channelsFromMetadata);
    }
  },
  methods: {
    channelsDataConversion(channels) {
      channels.forEach((item, i) => {
        channels[i].nameDisplay = `${ item.baseOS } ${ item.baseOSVersion } ${ item.flavor ? ` - ${ item.flavor }` : '' }`;
        channels[i].stateDisplay = '-';
        channels[i].imagePath = item.uri;
        channels[i].toggleSwitchData = {
          nameDisplay: channels[i].nameDisplay, // used for error display
          defaultName: item.defaultName, // used for ID of resource
          uri:         item.uri // used for image path field
        };
      });

      return channels;
    }
  },
};
</script>

<template>
  <div>
    <Loading v-if="$fetchState.pending" />
    <ResourceTable
      v-else
      :schema="schema"
      :rows="rows"
      :headers="headers"
      :group-by="$attrs.groupBy"
      :loading="$fetchState.pending"
      :groupable="false"
    />
  </div>
</template>
