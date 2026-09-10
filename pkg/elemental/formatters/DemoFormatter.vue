<script>
export default {
  props:      {
    value: {
      type:     String,
      default: () => ''
    }
  }
};
</script>

<template>
  <p>
    Formatter: {{ value }}
  </p>
</template>

