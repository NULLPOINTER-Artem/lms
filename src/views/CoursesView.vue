<script setup>
import { reactive, ref, triggerRef, watchEffect } from 'vue';
import { useClientHandle } from '@urql/vue';
import { useRouter } from 'vue-router';

// Helpers
import generateId from '../helpers/generateId.js';

// Hooks
import useCourseDeletion from '../hooks/useCourseDeletion.js';
import useParseCourse from '../hooks/useParseCourse.js';

// API
import {
  mutationCreateCourseBody,
} from '../API/mutationBodies.js';
import {
  queryCoursesBody
} from '../API/queryBodies.js';

// Components
import TableContainer from '../components/TableContainer.vue';
import AddIcon from '../components/icons/AddIcon.vue';

// Global
const router = useRouter();
const handleClient = useClientHandle();

// Hooks
const { parseCourse, parseCourses } = useParseCourse();
const { deleteCourse } = useCourseDeletion();

// State
const tableData = reactive({
  header_items: [],
  items: []
});
const currentParsedCourses = ref([]);

const mutationCreateCourse = handleClient.useMutation(mutationCreateCourseBody);

const queryCoursesVariables = reactive({
  project_id: localStorage.getItem('project_id')
});
const queryCourses = handleClient.useQuery({
  query: queryCoursesBody,
  pause: true,
  variables: queryCoursesVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

watchEffect(async () => {
  if (localStorage.getItem('project_id')) {
    queryCoursesVariables.project_id = localStorage.getItem('project_id');

    const response = await queryCourses.executeQuery();

    if (response.data.value) {
      const courses = response.data.value.entries_get.entries;

      currentParsedCourses.value = await parseCourses(courses);

      for (const course of currentParsedCourses.value) {
        setTableItem(course);
      }
    }
  }
});

function onAddCourse() {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);

  mutationCreateCourse.executeMutation({
    project_id: localStorage.getItem('project_id'),
    course_api_name: `entry__course_${newId}`,
    course_name: `New Course`,
  }).then((response) => {
    const newCourse = parseCourse(response.data.entries_create[0]);
    currentParsedCourses.value.push(newCourse);
    setTableItem(newCourse);
  });
}

function setTableHeader() {
  if (!tableData.header_items.length) {
    tableData.header_items = [
      'title',
      'paths',
      'creator',
      'action'
    ];
  }
}

function setTableItem(course) {
  setTableHeader();

  tableData.items.push({
    id: course.id,
    created_at: course.created_at,
    title: course.name,
    paths: course.course_paths,
    creator: 'Jerome Jones'
  });

  tableData.items.sort((a, b) => a.created_at - b.created_at);
}

function onDeleteItem({ item, menuOptions, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);
  const foundCourse = currentParsedCourses.value.find((course) => course.id === item.value.id);

  deleteCourse(foundCourse)
    .then(() => {
      menuItem.load = false;
      triggerRef(refOnShallowRef);
      menuOptions.style.display = 'none';

      tableData.items = tableData.items.filter((tableItem) => tableItem.id !== item.value.id);
      currentParsedCourses.value = currentParsedCourses.value.filter((course) => course.id !== item.value.id);
    });
}

function onEditItem({ item, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  router.push({ path: `/lms/courses/${item.value.id}/edit` }).then(() => {
    menuItem.load = false;
    triggerRef(refOnShallowRef);
  });
}
</script>

<template>
  <div class="courses-view">
    <header class="courses-view__header">
      <div class="courses-view__label">
        Courses
      </div>
      <div class="courses-view__tools">
        <button
          type="button"
          class="courses-view__tools-btn"
          @click="onAddCourse"
        >
          <AddIcon />
          New Course
        </button>
      </div>
    </header>
    <TableContainer
      v-if="currentParsedCourses.length"
      :table-data="tableData"
      @delete-item="onDeleteItem"
      @edit-item="onEditItem"
    />
    <div
      v-else
      class="courses-view__no-items"
    >
      There are no courses yet
    </div>
  </div>
</template>

<style lang="scss">
.courses-view {
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
