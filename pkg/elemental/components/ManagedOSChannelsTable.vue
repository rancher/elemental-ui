
<script>
import SortableTableWrapper from './SortableTableWrapper.vue';
export default {
  name:       'ManagedOSChannelsTable',
  components: { SortableTableWrapper },
  data() {
    return {
      tableHeaders: [
        {
          name:     'osVersionName',
          labelKey: 'tableHeaders.osVersion',
          value:    'title',
          getValue:  row => row.title,
          width:    200
        },
        // {
        //   name:      'osVersionFlavor',
        //   labelKey:  'tableHeaders.flavor',
        //   value:    'flavor',
        //   getValue:  row => row.flavor,
        //   width:     100
        // },
        {
          name:      'osVersionDescription',
          labelKey:  'tableHeaders.description',
          value:    'description',
          getValue:  row => row.description,
          width:     500

        }
      ],
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
      ]
    };
  },
  computed: {
    rows() {
      const customChannel = {
        baseOS:        '',
        baseOSVersion: '',
        title:         'Custom OS channel',
        description:   'Create your custom OS channel',
        uri:           ''
      };

      const channelsData = Object.assign([], this.rawChannelsData);

      channelsData.forEach((item, i) => {
        channelsData[i].title = `${ item.baseOS } ${ item.baseOSVersion } ${ item.flavor ? ` - ${ item.flavor }` : '' }`;
      });

      channelsData.push(customChannel);

      console.log('channelsData', channelsData);

      return channelsData;
    }
  },
};
</script>

<template>
  <div>
    <SortableTableWrapper
      :rows="rows"
      :headers="tableHeaders"
      :table-actions="false"
      :row-actions="false"
      key-field="uri"
      default-sort-by="name"
      :paging="true"
      :search="false"
      @selectRow="(row) => $emit('selectType', row)"
    />
  </div>
</template>

<style lang="scss" scoped>

</style>
