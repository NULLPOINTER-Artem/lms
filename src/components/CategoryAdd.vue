<script setup>
import { ref, defineProps, defineEmits } from 'vue';

// Components
import CategoryItem from './CategoryItem.vue';
import AddIcon from './icons/AddIcon.vue';

const props = defineProps({
  parsedCategories: {
    type: Array,
    required: true
  }
});
const emit = defineEmits(['delete-category', 'add-category']);

// State
const categoryName = ref('');

function onDeleteCategory(item) {
  emit('delete-category', item);
}

function onSubmit() {
  emit('add-category', categoryName.value);
  categoryName.value = '';
}
</script>

<template>
  <div class="category-popup">
    <div class="category-popup__heading">
      Add Category
    </div>
    <div class="category-popup__container">
      <div class="category-popup__form">
        <div class="category-popup__form-item">
          <input
            type="text"
            class="category-popup__form-name"
            placeholder="Type Category Name"
            v-model="categoryName"
          />
        </div>
        <div class="category-popup__form-item">
          <button
            type="button"
            class="category-popup__form-submit"
            :disabled="categoryName.length < 2"
            @click="onSubmit"
          >
            <AddIcon />
            Add
          </button>
        </div>
      </div>
      <div class="category-popup__list">
        <div v-if="props.parsedCategories.length" class="categories-list">
          <CategoryItem
            v-for="(categoryItem) of props.parsedCategories"
            :key="categoryItem.id"
            :category-item="categoryItem"
            @delete-category="onDeleteCategory(categoryItem)"
          />
        </div>
        <div v-else class="category-popup__list--no-items">
          No categories yet
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../assets/css/components/category/categories-list.scss';

.category-popup {
  display: flex;
  flex-direction: column;

  &__heading {
    align-self: center;
    font-size: 32px;
    color: #0B243D;
    font-weight: 700;
    margin-bottom: 35px;
  }

  &__container {
    padding: 15px 15px 30px;
  }

  &__list {
    max-height: 300px;
    overflow-y: auto;

    &--no-items {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #0B243D;
    }
  }

  &__form {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 45px;

    &-item {
      padding: 0 25px;
    }

    &-name {
      border-bottom: 1px solid #000;
      padding: 5px 10px;
    }

    &-type {
      cursor: pointer;
    }

    &-submit {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      padding: 5px 16px;
      background: #358DE8;
      border: 1px solid #358DE8;
      border-radius: 10px;
      outline: none;

      &:disabled {
        background-color: #98A2B3;
        border-color: #98A2B3;
      }

      svg {
        margin-right: 7px;
      }
    }
  }
}
</style>
