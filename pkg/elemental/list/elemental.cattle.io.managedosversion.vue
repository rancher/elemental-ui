<script>
import ResourceTable from '@shell/components/ResourceTable';
export default {
  name:       'ListManagedOsVersion',
  components: { ResourceTable },
  props:      {
    resource: {
      type:     String,
      required: true,
    },
    schema: {
      type:     Object,
      required: true,
    },
    rows: {
      type:     Array,
      required: true,
    },
    loading: {
      type:     Boolean,
      required: false,
    },
  },
  computed: {
    parsedRows() {
      return this.rows.filter(r => r.spec?.type === 'container');
    }
  },
};
</script>

<template>
  <div>
    <ResourceTable
      :schema="schema"
      :rows="parsedRows"
      :loading="loading"
    />
  </div>
</template>
