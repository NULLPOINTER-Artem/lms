<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useClientHandle } from '@urql/vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';

// Hooks
import useParseLearningPath from '../hooks/useParseLearningPath.js';

// API
import {
  mutationUpdateLearningPathBody,
  mutationUpdateCourseOrderBody
} from '../API/mutationBodies.js';
import {
  queryLearningPathBody,
  queryCoursesForSelectFilteredByLPCoursesBody,
  queryCoursesForSelectInLPBody,
} from '../API/queryBodies.js';
import { setElementValueInputEntry } from '../API/tools/common.js';

// Components
import CoursesList from '../components/CoursesList.vue';
import ModalWindow from '../components/ModalWindow.vue';
import AddIcon from '../components/icons/AddIcon.vue';
import CancelIcon from '../components/icons/CancelIcon.vue';
import CompletedIcon from '../components/icons/CompletedIcon.vue';

// Global
const route = useRoute();
const router = useRouter();
const handleClient = useClientHandle();

// Hooks
const { parseLearningPath, parseCourseForLP } = useParseLearningPath();

// State
const coursesToSelect = ref([]);
const localAddedCourses = ref([]);
const localDeletedCourses = ref([]);
const toggle = ref(false);
const save = ref(false);
const currentLearningPath = ref({});

const mutationUpdateLearningPath = handleClient.useMutation(mutationUpdateLearningPathBody);
const mutationUpdateCourseOrder = handleClient.useMutation(mutationUpdateCourseOrderBody);

const queryLearningPathVariables = reactive({
  project_id: localStorage.getItem('project_id'),
  lp_id: ''
});
const queryLearningPath = handleClient.useQuery({
  query: queryLearningPathBody,
  pause: true,
  variables: queryLearningPathVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

const queryCoursesForSelectFilteredByLPCoursesVariables = reactive({
  project_id: localStorage.getItem('project_id'),
  course_ids: []
});
const queryCoursesForSelectFilteredByLPCourses = handleClient.useQuery({
  query: queryCoursesForSelectFilteredByLPCoursesBody,
  pause: true,
  variables: queryCoursesForSelectFilteredByLPCoursesVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

const queryCoursesForSelectInLPVariables = reactive({
  project_id: localStorage.getItem('project_id')
});
const queryCoursesForSelectInLP = handleClient.useQuery({
  query: queryCoursesForSelectInLPBody,
  pause: true,
  variables: queryCoursesForSelectInLPVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

onMounted(async () => {
  queryLearningPathVariables.lp_id = route.params.id;

  const response = await queryLearningPath.executeQuery();
  currentLearningPath.value = parseLearningPath(response.data.value.entries_get.entries[0]);

  if (currentLearningPath.value.courses.length) {
    const course_ids = currentLearningPath.value.courses.map((course) => course.id);

    queryCoursesForSelectFilteredByLPCoursesVariables.project_id = localStorage.getItem('project_id');
    queryCoursesForSelectFilteredByLPCoursesVariables.course_ids = course_ids;

    const response_queryCourses = await queryCoursesForSelectFilteredByLPCourses.executeQuery();
    coursesToSelect.value = response_queryCourses.data.value.entries_get.entries.map(
      (course) => parseCourseForLP(course)
    );
  } else {
    queryCoursesForSelectInLPVariables.project_id = localStorage.getItem('project_id');

    const response_queryCourses = await queryCoursesForSelectInLP.executeQuery();
    coursesToSelect.value = response_queryCourses.data.value.entries_get.entries.map(
      (course) => parseCourseForLP(course)
    );
  }
});

onBeforeRouteLeave((to, from, next) => {
  if (!save.value) onCancel(false);

  next();
});

function onAddCourse() {
  onToggleModal();
}

function onToggleModal() {
  toggle.value = !toggle.value;
}

function onSelectCourse(courseItem) {
  const lastCourse = currentLearningPath.value.courses.slice(-1)[0];
  courseItem.course_order[currentLearningPath.value.id] = lastCourse ?
    Number.parseInt(lastCourse.course_order[currentLearningPath.value.id]) + 1
    : 1;

  currentLearningPath.value.courses = [...currentLearningPath.value.courses, courseItem];
  localAddedCourses.value = [...localAddedCourses.value, courseItem];
  localDeletedCourses.value = localDeletedCourses.value.filter(
    (courseItem) => courseItem.id !== courseItem.id
  );
  coursesToSelect.value = coursesToSelect.value.filter((course) => course.id !== courseItem.id);
}

function onDeleteCourse({ item }) {
  delete item.value.course_order[currentLearningPath.value.id];

  localAddedCourses.value = localAddedCourses.value.filter((course) => course.id !== item.value.id);
  localDeletedCourses.value.push(item.value);
  currentLearningPath.value.courses = currentLearningPath.value.courses
    .filter((course) => course.id !== item.value.id);
  coursesToSelect.value.push(item.value);
}

function onSave() {
  save.value = true;
  const course_ids = currentLearningPath.value.courses.map((course) => course.id)

  for(const course of currentLearningPath.value.courses) {
    mutationUpdateCourseOrder.executeMutation({
      project_id: localStorage.getItem('project_id'),
      course_id: course.id,
      course_order: JSON.stringify(course.course_order)
    });
  }

  mutationUpdateLearningPath.executeMutation({
    project_id: localStorage.getItem('project_id'),
    lp_id: currentLearningPath.value.id,
    lp_name: currentLearningPath.value.name,
    lp_description: currentLearningPath.value.description,
    lp_courses: course_ids.length ?
      setElementValueInputEntry(
        {
          id__in: course_ids
        }
      ) : {}
  }).then(() => router.push('/lms/learning-paths'));
}

function onCancel(back = true) {
  for (const course of localDeletedCourses.value) {
    delete course.course_order[currentLearningPath.value.id];

    mutationUpdateCourseOrder.executeMutation({
      project_id: localStorage.getItem('project_id'),
      course_id: course.id,
      course_order: JSON.stringify(course.course_order)
    });
  }

  if (back) router.push('/lms/learning-paths');
}

function onUpdateList(updatedList) {
  currentLearningPath.value.courses = [...updatedList];
}
</script>

<template>
  <modal-window
    v-if="toggle"
    @close-window="onToggleModal"
  >
    <CoursesList
      :courses="coursesToSelect"
      :has-action-bar="false"
      :is-draggable="false"
      @select-course="onSelectCourse"
    />
  </modal-window>
  <div class="learning-path-edit">
    <div class="learning-path-edit__heading">
      <div class="learning-path-edit__heading-name">
        Edit Learning Path
      </div>
    </div>
    <div class="learning-path-edit__form">
      <div class="learning-path-edit__form-item">
        <div class="learning-path-edit__form-name">
          Name
        </div>
        <div class="learning-path-edit__form-item__name">
          <input
            type="text"
            name="learning-path-name"
            placeholder="Type your name..."
            v-model="currentLearningPath.name"
          />
        </div>
      </div>

      <div class="learning-path-edit__form-item">
        <div class="learning-path-edit__form-name">
          Description
        </div>
        <div class="learning-path-edit__form-item__description">
          <textarea
            type="text"
            name="learning-path-description"
            placeholder="Type your description..."
            v-model="currentLearningPath.description"
          />
        </div>
      </div>

      <div class="learning-path-edit__form-item">
        <div class="learning-path-edit__form-item__courses">
          <div class="learning-path-edit__form-item__courses-container">
            <span class="learning-path-edit__form-item__courses-label">Courses</span>
            <button
              type="button"
              class="learning-path-edit__form-item__btn"
              @click="onAddCourse"
            >
              <AddIcon />
              Add Course
            </button>
          </div>
          <CoursesList
            v-if="currentLearningPath.courses && currentLearningPath.courses.length"
            :courses="currentLearningPath.courses"
            :has-parent-controller="true"
            @update-list="onUpdateList"
            @delete-course="onDeleteCourse"
          />
        </div>
      </div>
    </div>
    <div class="learning-path-edit__control">
      <button type="button" class="learning-path-edit__control-save" @click="onSave">
        <CompletedIcon
          :icon-options="{
            strokeColor: 'white',
            strokeWidth: '2.67',
            width: '21',
            height: '21',
            viewBox: '0 0 32 32'
          }"
        />
        Save
      </button>
      <button type="button" class="learning-path-edit__control-cancel" @click="onCancel">
        <CancelIcon />
        Cancel
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.learning-path-edit {
  padding: 20px 40px;

  &__heading {
    margin-bottom: 25px;

    &-name {
      font-weight: 700;
      font-size: 24px;
      color: #0B243D;
    }
  }

  &__form {
    padding: 30px;
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 10px;

    &-label {
      font-weight: 500;
      font-size: 14px;
      color: #101828;
      margin-bottom: 20px;
    }

    &-name {
      position: absolute;
      left: 10px;
      top: -10px;
      background-color: #fff;
      font-weight: 500;
      font-size: 14px;
      color: #0B243D;
    }

    &-file {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      &__container {
        border: 1px solid #D0D5DD;
        border-radius: 10px;
        position: relative;
        padding: 10px 16px 10px 50px;
        max-width: 170px;
        margin-right: 10px;
      }

      &__icon {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
      }

      input[type="file"] {
        visibility: hidden;
        cursor: pointer;
        width: 100%;

        &::before {
          content: attr(data-placeholder);
          visibility: visible;
          font-weight: 500;
          font-size: 14px;
          color: #0B243D;
        }
      }

      &__status {
        font-weight: 500;
        font-size: 14px;
        color: #A6B2C1;
      }

      &--loaded {
        color: #101828;
      }
    }

    &-item {
      margin-bottom: 20px;
      position: relative;

      &__name {
        border: 1px solid #AEB4C2;
        border-radius: 10px;
        padding: 14px 16px;

        input {
          width: 100%;

          &::placeholder {
            font-weight: 500;
            font-size: 14px;
            color: #98A2B3;
          }
        }
      }

      &__description {
        border: 1px solid #AEB4C2;
        border-radius: 10px;
        padding: 14px 16px;

        textarea {
          width: 100%;

          &::placeholder {
            font-weight: 500;
            font-size: 14px;
            color: #98A2B3;
          }
        }
      }

      &__courses {
        &-label {
          display: block;
          color: #0B243D;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 20px;
        }

        &-container {
          padding-bottom: 30px;
          margin-bottom: 20px;
          border-bottom: 1px solid #EAECF0;
        }
      }

      &__btn {
        margin-bottom: 20px;

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
  }

  &__control {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &-save {
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
      box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
      margin-right: 15px;
    }

    &-cancel {
      svg {
        margin-right: 7px;
      }

      color: #0B243D;
      border: 1px solid #D0D5DD;
      border-radius: 10px;
      padding: 10px 16px;
      background: #FFFFFF;
    }
  }
}
</style>
