<script>
  import { rootDesktopRoute, createDesktopRoute } from '../routing/utils';

  export default {
    name: 'base-view',
    data() {
      console.log('saddaadsdas', createDesktopRoute('general'))
      return {
        generalLink: createDesktopRoute('general'),
        portFowardingLink: createDesktopRoute('portforwarding'),
        imagesLink: createDesktopRoute('images'),
      }
    },
  }
</script>

<template>
  <div id="base-layout">
    <!-- <div class="sidebar">
      <router-link 
        class="demo-link"
        :to="page1Link">DESKTOP</router-link>
      <router-link 
        class="demo-link"
        :to="page1Link">EXPLORER</router-link>
    </div> -->
    <div class="desktop-menu">
      <router-link :to="generalLink">GENERAL</router-link>
      <router-link :to="portFowardingLink">PORT-FORWARDING</router-link>
      <router-link :to="imagesLink">IMAGES</router-link>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#base-layout {
  padding: 0;
  display: flex;
  width: 100%;
  height: 100%;
  flex-wrap: nowrap;
  flex-direction: row;

  // .sidebar {
  //   width: 100px;
  //   height: 100%;
  //   border: 2px solid blue;
  //   padding: 10px;
  // }

  .desktop-menu {
    width: 120px;
    height: 100%;
    border: 2px solid black;
    padding: 10px;

    a {
      display: block;
      margin-bottom: 10px;
    }
  }
  
  .main-content {
    width: calc(100% - 120px);
    height: 100%;
  }

  .demo-link {
    border: 1px solid black;
    height: 30px;
    margin-bottom: 20px;
    display: block;
  }
}
</style>