<script setup>
import { RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
import useEventEmitter from './hooks/useEventEmitter.js';

useEventEmitter().getEmitter(); // create emitter instance
</script>

<template>
  <AppNavbar />

  <div class="bg-app">
    <router-view />
  </div>

  <div class="top-placement" />
</template>

<style lang="scss">
@import './assets/css/abstracts/reset.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  position: relative;
}

.bg-app {
  background-color: #eff2f5;
  min-height: 93vh;
}

.top-placement {
  position: absolute;
  z-index: 1000;
  top: 0;
  left: 0;
}
</style>
