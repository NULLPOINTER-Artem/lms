<script setup>
import Loader from '../components/LoaderComponent.vue';
</script>

<template>
  <div class="loading-data">
    <span class="loading-data__label">Loading</span>
    <Loader :load="true" />
  </div>
</template>

<style lang="scss">
.loading-data {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  min-height: 100vh;

  &__label {
    font-weight: 700;
    font-size: 42px;
  }

  .loader {
    margin-left: 20px;
    width: 55px;
    height: 55px;
    font-size: 5px;
    left: unset;
    top: unset;
    bottom: unset;
    right: unset;
  }
}
</style>
