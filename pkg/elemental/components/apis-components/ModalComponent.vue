<script>
  import AsyncButton from '@shell/components/AsyncButton';

  export default {
    name: 'ModalComponent',
    components: {
      AsyncButton,
    },
    methods: {
      handleClick() {
        console.log('Modal button clicked!');
        this.$emit('close');
      }
    },
  }
</script>

<template>
  <div class="main-modal-container">
    <div class="mb-20">
      <h1 class="mb-20">Sample general title</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </div>
    <div class="dialog-buttons mt-40">
      <button
        class="btn role-secondary"
        @click="handleClick"
      >
        {{ t('generic.cancel') }}
      </button>
      <AsyncButton
        mode="add"
        @click="handleClick"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-modal-container {
  padding: 20px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;

  > *:not(:last-child) {
    margin-right: 10px;
  }
}
</style>