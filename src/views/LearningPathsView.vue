<script setup>
import { ref, reactive, watchEffect, triggerRef } from 'vue';
import { useRouter } from 'vue-router';
import { useClientHandle } from '@urql/vue';

// Helpers
import generateId from '../helpers/generateId.js';

// Hooks
import useParseLearningPath from '../hooks/useParseLearningPath.js';

// API
import {
  mutationCreateLearningPathBody,
  mutationDeleteLearningPathBody,
  mutationUpdateCourseOrderBody
} from '../API/mutationBodies.js';
import {
  queryLearningPathsBody,
} from '../API/queryBodies.js';
import AddIcon from '../components/icons/AddIcon.vue';

// Components
import TableContainer from '../components/TableContainer.vue';

// Global
const router = useRouter();
const handleClient = useClientHandle();

// Hooks
const { parseLearningPath } = useParseLearningPath();

// State
const currentParsedPaths = ref([]);
const tableData = reactive({
  header_items: [],
  items: []
});

const mutationCreateLearningPath = handleClient.useMutation(mutationCreateLearningPathBody);
const mutationDeleteLearningPath = handleClient.useMutation(mutationDeleteLearningPathBody);
const mutationUpdateCourseOrder = handleClient.useMutation(mutationUpdateCourseOrderBody);

const queryLearningPathsVariables = reactive({
  project_id: localStorage.getItem('project_id')
});
const queryLearningPaths = handleClient.useQuery({
  query: queryLearningPathsBody,
  pause: true,
  variables: queryLearningPathsVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

watchEffect(async () => {
  if (localStorage.getItem('project_id')) {
    queryLearningPathsVariables.project_id = localStorage.getItem('project_id');

    const response = await queryLearningPaths.executeQuery();

    if (response.data.value) {
      const learningPaths = response.data.value.entries_get.entries
        .map((learning_path) => parseLearningPath(learning_path));

      for await (const learningPath of learningPaths) setTableItem(learningPath);
    }
  }
});

function setTableHeader() {
  if (!tableData.header_items.length) {
    tableData.header_items = [
      'title',
      'courses',
      'duration',
      'action'
    ];
  }
}

function setTableItem(learningPath) {
  currentParsedPaths.value.push(learningPath);
  setTableHeader();

  tableData.items.push({
    id: learningPath.id,
    created_at: learningPath.created_at,
    title: learningPath.name,
    courses: learningPath.count_courses,
    path_courses: learningPath.courses,
    duration: learningPath.duration + ' Hours'
  });

  tableData.items.sort((a, b) => a.created_at - b.created_at);
}

function onAddPath() {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);

  mutationCreateLearningPath.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lp_api_name: `entry__learning_path_${newId}`,
    lp_name: `New Learning Path`,
    lp_description: ''
  }).then((response) => {
    setTableItem(parseLearningPath(response.data.entries_create[0]));
  });
}

function onDeleteItem({ item, menuOptions, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  for (const course of item.value.path_courses) {
    delete course.course_order[item.value.id];

    mutationUpdateCourseOrder.executeMutation({
      project_id: localStorage.getItem('project_id'),
      course_id: course.id,
      course_order: JSON.stringify(course.course_order)
    });
  }

  mutationDeleteLearningPath.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lp_id: item.value.id
  }).then(() => {
    menuItem.load = false;
    triggerRef(refOnShallowRef);
    menuOptions.style.display = 'none';

    tableData.items = tableData.items.filter((tableItem) => tableItem.id !== item.value.id);
    currentParsedPaths.value = currentParsedPaths.value.filter((lp) => lp.id !== item.value.id);
  });
}

function onEditItem({ item, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  router.push({ path: `/lms/learning-paths/${item.value.id}/edit` }).then(() => {
    menuItem.load = false;
    triggerRef(refOnShallowRef);
  });
}
</script>

<template>
  <div class="learning-paths-view">
    <header class="learning-paths-view__header">
      <div class="learning-paths-view__label">
        Learning Paths
      </div>
      <div class="learning-paths-view__tools">
        <button
          type="button"
          class="learning-paths-view__tools-btn"
          @click="onAddPath"
        >
          <AddIcon />
          New Path
        </button>
      </div>
    </header>
    <TableContainer
      v-if="currentParsedPaths.length"
      :table-data="tableData"
      @delete-item="onDeleteItem"
      @edit-item="onEditItem"
    />
    <div
      v-else
      class="learning-paths-view__no-items"
    >
      There are no learning paths yet
    </div>
  </div>
</template>

<style lang="scss">
.learning-paths-view {
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
