<script setup>
import { computed, defineEmits, defineProps, ref } from 'vue';
import { useClientHandle } from '@urql/vue';

// Helpers
import generateId from '../helpers/generateId.js';

// API
import {
  mutationUpdateLessonCategoriesBody,
  mutationCreateCategoryBody,
  mutationDeleteCategoryBody
} from '../API/mutationBodies.js';
import { setElementValueInputEntry } from '../API/tools/common.js';

// Components
import ModalWindow from './ModalWindow.vue';
import CategoryAdd from './CategoryAdd.vue';
import CategoryItem from './CategoryItem.vue';
import RoundedAddIcon from './icons/RoundedAddIcon.vue';

const emit = defineEmits(['input-lesson-name']);
const props = defineProps({
  lessonName: {
    type: String,
    required: true
  },
  lessonCategories: {
    type: [Array, null],
    required: true
  },
  setLessonCategories: {
    type: Function,
    default: () => {}
  },
  lessonEntryId: {
    type: String,
    required: true
  }
});

// Global
const handleClient = useClientHandle();

// State
const showCategoryPopup = ref(false);

// Computes
const parsedCategories = computed(() => {
  return props.lessonCategories ? props.lessonCategories : [];
});

const mutationUpdateLessonCategories = handleClient.useMutation(mutationUpdateLessonCategoriesBody);
const mutationCreateCategory = handleClient.useMutation(mutationCreateCategoryBody);
const mutationDeleteCategory = handleClient.useMutation(mutationDeleteCategoryBody);

function onInputLessonName(event) {
  emit('input-lesson-name', event.target.textContent);
}

function onToggleAddCategory() {
  showCategoryPopup.value = !showCategoryPopup.value;
}

function onDeleteCategory(item) {
  const copyParsedCategories = [...parsedCategories.value];
  const filteredCopy = copyParsedCategories.filter((category) => String(category.id) !== String(item.id));

  props.setLessonCategories(filteredCopy);

  mutationDeleteCategory.executeMutation({
    project_id: localStorage.getItem('project_id'),
    category_id: item.id
  });
}

function onAddCategory(categoryName) {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);
  const copyParsedCategories = [...parsedCategories.value];

  mutationCreateCategory.executeMutation({
    project_id: localStorage.getItem('project_id'),
    category_api_name: `entry_category__${newId}`,
    category_name: categoryName
  })
    .then((response) => {
      const newCategory = response.data.entries_create[0];
      copyParsedCategories.push({
        id: newCategory.id,
        name: newCategory.name[0].text_value
      });

      props.setLessonCategories(copyParsedCategories);

      updateCategories(copyParsedCategories);
    });
}

function updateCategories(updatedCategories) {
  const category_ids = updatedCategories.map((category) => category.id);

  mutationUpdateLessonCategories.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lesson_id: props.lessonEntryId,
    lesson_categories: category_ids.length ?
      setElementValueInputEntry(
        {
          id__in: category_ids
        }
      ) : {}
  });
}
</script>

<template>
  <modal-window v-if="showCategoryPopup" @close-window="onToggleAddCategory">
    <CategoryAdd
      :parsed-categories="parsedCategories"
      @delete-category="onDeleteCategory"
      @add-category="onAddCategory"
    />
  </modal-window>
  <div class="editor-bar">
    <div class="editor-bar__data">
      <div class="editor-bar__name" contenteditable="true" @input="onInputLessonName">
        {{ props.lessonName }}
      </div>
      <div class="editor-bar__categories">
        <div class="editor-bar__categories-label">
          Categories
        </div>
        <div class="editor-bar__categories-container">
          <div class="categories-list">
            <CategoryItem
              v-for="(categoryItem) of parsedCategories"
              :key="categoryItem.id"
              :category-item="categoryItem"
              @delete-category="onDeleteCategory(categoryItem)"
            />
          </div>
        </div>
        <button
          type="button"
          class="editor-bar__categories-btn"
          @click="onToggleAddCategory"
        >
          <RoundedAddIcon />
          Add
        </button>
      </div>
    </div>
    <div class="editor-bar__tools">
      <div class="editor-bar__knowledge">
        <div class="editor-bar__knowledge-label">
          Knowledgebase
        </div>
        <label class="editor-bar__knowledge-switch" for="knowledge">
          <input type="checkbox" name="knowledge" />
          <div class="editor-bar__knowledge-slide" />
          <div class="editor-bar__knowledge-detection">
            <span>Visible</span>
            <span>Hidden</span>
          </div>
        </label>
      </div>
      <div class="editor-bar__btn">
        <button type="button" class="editor-bar__btn-publish">Publish</button>
        <button type="button" class="editor-bar__btn-preview">Preview</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../assets/css/components/category/categories-list.scss';
@import '../assets/css/abstracts/mixins.scss';

.editor-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 35px 20px;

  &__data {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 55%;
  }

  &__name {
    color: #0B243D;
    font-size: 24px;
    line-height: 32px;
    font-weight: 700;
    text-transform: capitalize;
    margin-right: 20px;
  }

  &__categories {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-label {
      color: #0B243D;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      margin-right: 8px;
    }

    &-container {
      @include invisible-scroll;

      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 10px;
      max-height: 65px;
      max-width: 440px;
      overflow-y: auto;
    }

    &-btn {
      font-size: 14px;
      border: 1px solid #D0D5DD;
      background: #FFFFFF;
      padding: 10px 25px;
      color: #0B243D;
      border-radius: 16px;

      svg {
        width: 20px;
        height: 20px;
        margin-right: 7px;
        vertical-align: middle;
      }
    }
  }

  &__tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 43%;
  }

  &__knowledge {
    margin-right: 20px;

    &-label {
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }

    &-switch {
      display: inline-block;
      vertical-align: middle;
      position: relative;
      width: 144px;
      height: 40px;
      padding: 5px;
      border: 1px solid #D0D5DD;
      border-radius: 10px;

      input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;

        &:checked+.editor-bar__knowledge-slide {
          &::before {
            transform: translateX(-64px);
          }
        }
      }
    }

    &-slide {
      pointer-events: none;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #ccc;
      border-radius: 10px;
      transition: .4s;
      z-index: 1;

      &::before {
        content: '';
        position: absolute;
        right: 4px;
        bottom: 5px;
        transition: .4s;
        background-color: #358DE8;
        width: 71px;
        height: 28px;
        border-radius: 5px;
      }
    }

    &-detection {
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      top: 50%;
      transform: translateY(-50%);
      padding: 0 10px;
      z-index: 2;

      span {
        font-weight: 700;
        font-size: 14px;
        color: #EBF5FF;
      }
    }
  }

  &__btn {
    font-size: 14px;

    &-publish {
      margin-right: 15px;
      border-radius: 16px;
      border: 1px solid #D0D5DD;
      background: #FFFFFF;
      padding: 10px 25px;
      color: #0B243D;
    }

    &-preview {
      border-radius: 16px;
      border: 1px solid #D0D5DD;
      background: #FFFFFF;
      padding: 10px 25px;
      color: #0B243D;
    }
  }
}
</style>
