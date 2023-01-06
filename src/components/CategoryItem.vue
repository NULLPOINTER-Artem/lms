<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  categoryItem: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['delete-category']);

function onDeleteCategory() {
  emit('delete-category');
}
</script>

<template>
  <div class="categories-item">
    <button
      class="categories-item__delete"
      @click="onDeleteCategory"
    >
      X
    </button>
    <div class="categories-item__name">
      {{ props.categoryItem.name }}
    </div>
  </div>
</template>

<style lang="scss">
.categories-item {
  padding: 4px 12px;
  background-color: #def0e9;
  border-radius: 16px;
  margin: 0 5px 5px 0;

  &-success {
    color: #09A55C;
  }

  &-primary {
    color: #358DE8;
  }

  &-warning {
    color: #B54708;
  }

  &__delete {
    background: transparent;
    color: #F04438;
    margin-right: 8px;
    font-size: 9px;
    width: 8px;
    display: inline-block;
    vertical-align: middle;
    font-weight: 800;
  }

  &__name {
    font-weight: 800;
    font-size: 14px;
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
