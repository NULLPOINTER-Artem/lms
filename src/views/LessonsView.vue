<script setup>
import { reactive, ref, triggerRef, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useClientHandle } from '@urql/vue';

// Helpers
import generateId from '../helpers/generateId.js';

// Hooks
import useParseLesson from '../hooks/useParseLesson.js';
import usePagesDeletion from '../hooks/usePagesDeletion.js';

// API
import {
  mutationCreateLessonBody,
} from '../API/mutationBodies.js';
import {
  queryLessonsBody
} from '../API/queryBodies.js';

// Components
import TableContainer from '../components/TableContainer.vue';
import AddIcon from '../components/icons/AddIcon.vue';

// Global
const router = useRouter();
const handleClient = useClientHandle();

// Hooks
const { parseLesson } = useParseLesson();
const { deleteLesson } = usePagesDeletion();

// State
const tableData = reactive({
  header_items: [],
  items: []
});
const currentParsedLessons = ref([]);

// Mutations
const mutationCreateLesson = handleClient.useMutation(mutationCreateLessonBody);

// Queries
const queryLessonsVariables = {
  project_id: localStorage.getItem('project_id')
};
let queryLessons = handleClient.useQuery({
  query: queryLessonsBody,
  pause: true,
  variables: queryLessonsVariables,
  context: {
    requestPolicy: 'cache-and-network'
  }
});

watchEffect(async () => {
  if (localStorage.getItem('project_id')) {
    queryLessonsVariables.project_id = localStorage.getItem('project_id');

    const response = await queryLessons.executeQuery();

    if (response.data.value) {
      const lessons = response.data.value.entries_get.entries;

      const parsedLessons = lessons.map((lesson) => parseLesson(lesson));

      for (const lesson of parsedLessons) setTableItem(lesson);
    }
  }
});

function onAddLesson() {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);
  const [lastItem] = tableData.items.slice(-1);

  mutationCreateLesson.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lesson_api_name: `entry__lesson_${newId}`,
    lesson_name: `New Lesson`,
    lesson_description: '',
    lesson_order_id: lastItem ? String(Number.parseInt(lastItem.lesson_order_id) + 1) : '1',
  }).then((response) => setTableItem(parseLesson(response.data.entries_create[0])));
}

function getLessonCountPages(lesson) {
  const lessonPages = lesson.elements.find(
    (element) => element.api_name.includes('element__lesson_pages__entry')
  ).value ?? [];

  return lessonPages.length ?? 0;
}

function setTableHeader() {
  if (!tableData.header_items.length) {
    tableData.header_items = [
      'title',
      'pages',
      'creator',
      'action'
    ];
  }
}

function setTableItem(lesson) {
  setTableHeader();
  currentParsedLessons.value.push(lesson);
  const lesson_order_id = lesson.elements.find(
    (lessonItem) => lessonItem.api_name.includes('element__lesson_order__text')
  ).value;

  tableData.items.push({
    id: lesson.id,
    created_at: lesson.created_at,
    lesson_order_id: Number.parseInt(lesson_order_id),
    title: lesson.name,
    pages: getLessonCountPages(lesson),
    creator: 'Jerome Jones'
  });

  tableData.items.sort((a, b) => a.created_at - b.created_at);
}

function onDeleteItem({ item, menuOptions, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);
  const foundLesson = currentParsedLessons.value.find((lesson) => lesson.id === item.value.id);

  deleteLesson(foundLesson)
    .then(() => {
      menuItem.load = false;
      triggerRef(refOnShallowRef);
      menuOptions.style.display = 'none';

      tableData.items = tableData.items.filter((tableItem) => tableItem.id !== item.value.id);
      currentParsedLessons.value = currentParsedLessons.value.filter(
        (lesson) => lesson.id !== item.value.id
      );
    });
}

function onEditItem({ item, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  router.push({ path: `/lms/lessons/${item.value.id}/edit` }).then(() => {
    menuItem.load = false;
    triggerRef(refOnShallowRef);
  });
}
</script>

<template>
  <div class="lessons-view">
    <header class="lessons-view__header">
      <div class="lessons-view__label">
        Lessons
      </div>
      <div class="lessons-view__tools">
        <button
          type="button"
          class="lessons-view__tools-btn"
          @click="onAddLesson"
        >
          <AddIcon />
          New Lesson
        </button>
      </div>
    </header>
    <TableContainer
      v-if="currentParsedLessons.length"
      :table-data="tableData"
      @delete-item="onDeleteItem"
      @edit-item="onEditItem"
    />
    <div
      v-else
      class="lessons-view__no-items"
    >
      There are no lessons yet
    </div>
  </div>
</template>

<style lang="scss">
.lessons-view {
  padding: 45px 45px 0;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__label {
    color: #0B243D;
    font-weight: 700;
    font-size: 24px;
  }

  &__tools {
    &-btn {
      svg {
        margin-right: 7px;
      }

      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      padding: 10px 16px;
      background: #358DE8;
      border: 1px solid #358DE8;
      border-radius: 10px;
    }
  }

  &__no-items {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #0B243D;
  }
}
</style>
