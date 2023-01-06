<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClientHandle } from '@urql/vue';

// Hooks
import useProgress from '../hooks/useProgress.js';
import useParseLearningPath from '../hooks/useParseLearningPath.js';

// API
import {
  queryLearningPathsForUserBody,
  queryAllCoursesForUserBody,
  queryAllCoursesForUserFilteredByLPCoursesBody
} from '../API/queryBodies.js';
import { DEFAULT_THUMBNAIL } from '../API/constants.js';

// Components
import UserCoursesList from '../components/UserCoursesList.vue';
import UserCoursesItem from '../components/UserCoursesItem.vue';
import SearchIcon from '../components/icons/SearchIcon.vue';

// Global
const handleClient = useClientHandle();
const router = useRouter();

// Hooks
const { parseLearningPath, parseCourseForLP } = useParseLearningPath();
const { getAllProgress } = useProgress();

// State
const materials = ref([]);
const individualCourses = ref([]);
const showCompleted = ref(false);

// Computes
const individualMaterialCountHours = computed(() => {
  return individualCourses.value.reduce((acc, course) => acc += course.duration, 0);
});
const individualMaterialCountCourses = computed(() => {
  return individualCourses.value.length;
});
const individualMaterialCountLessons = computed(() => {
  return individualCourses.value.reduce((acc, course) => acc += course.count_lessons, 0);
});
const completedMaterials = computed(() => {
  return materials.value.filter((material) => material.progress === 100);
});
const completedIndividualCourses = computed(() => {
  return individualCourses.value.filter((course) => course.progress === 100);
});
const completedItemsCounter = computed(() => {
  return completedMaterials.value.length + completedIndividualCourses.value.length;
});

// GraphQL Queries
const queryLearningPathsForUserVariables = reactive({
  project_id: localStorage.getItem('project_id')
});
const queryLearningPathsForUser = handleClient.useQuery({
  query: queryLearningPathsForUserBody,
  pause: true,
  variables: queryLearningPathsForUserVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

const queryAllCoursesForUserVariables = reactive({
  project_id: localStorage.getItem('project_id')
});
const queryAllCoursesForUser = handleClient.useQuery({
  query: queryAllCoursesForUserBody,
  pause: true,
  variables: queryAllCoursesForUserVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

const queryAllCoursesForUserFilteredByLPCoursesVariables = reactive({
  project_id: localStorage.getItem('project_id'),
  course_ids: []
});
const queryAllCoursesForUserFilteredByLPCourses = handleClient.useQuery({
  query: queryAllCoursesForUserFilteredByLPCoursesBody,
  pause: true,
  variables: queryAllCoursesForUserFilteredByLPCoursesVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

onMounted(async () => {
  queryLearningPathsForUserVariables.project_id = localStorage.getItem('project_id');

  const response_queryLearningPathsForUser = await queryLearningPathsForUser.executeQuery();

  if (response_queryLearningPathsForUser.data.value) {
    const learningPathItems = response_queryLearningPathsForUser.data.value.entries_get.entries
      .map((lp) => setPathItem(parseLearningPath(lp)));

    if (!learningPathItems.length) {
      // Request only courses if we do not have at least one Learning Path
      const allCourses = await getAllCourses();

      individualCourses.value = allCourses.splice(0, 2).sort((a, b) => a.created_at - b.created_at);
      materials.value = allCourses.sort((a, b) => a.created_at - b.created_at);
    } else {
      const path_course_ids = [];
      const all_courses_of_paths = [];

      for (const lp of learningPathItems) {
        all_courses_of_paths.push(...lp.courses);
        path_course_ids.push(...lp.courses.map((course) => course.id));
      }

      if (path_course_ids.length) {
        queryAllCoursesForUserFilteredByLPCoursesVariables.project_id = localStorage.getItem('project_id');
        queryAllCoursesForUserFilteredByLPCoursesVariables.course_ids = path_course_ids;

        const response_queryFilteredCourses = await queryAllCoursesForUserFilteredByLPCourses.executeQuery();

        if (response_queryFilteredCourses.data.value) {
          const filteredCourses = response_queryFilteredCourses.data.value.entries_get.entries.map(
            (course) => setCourseItem(parseCourseForLP(course)
          ));

          await setCoursesProgress([...filteredCourses, ...all_courses_of_paths]);

          individualCourses.value = filteredCourses.splice(0, 2)
            .sort((a, b) => a.created_at - b.created_at);
          materials.value = [...learningPathItems, ...filteredCourses]
            .sort((a, b) => a.created_at - b.created_at);
        }
      } else {
        // Request all courses if we do not have at least one course in a Learning Paths
        const allCourses = await getAllCourses();

        individualCourses.value = allCourses.splice(0, 2)
          .sort((a, b) => a.created_at - b.created_at);
        materials.value = [...learningPathItems, ...allCourses]
          .sort((a, b) => a.created_at - b.created_at);
      }

      materials.value.forEach((material) => countMaterialProgress(material));
    }
  }
});

async function getAllCourses() {
  queryAllCoursesForUserVariables.project_id = localStorage.getItem('project_id');

  const response_queryAllCoursesForUser = await queryAllCoursesForUser.executeQuery();

  if (response_queryAllCoursesForUser.data.value) {
    const allCourses = response_queryAllCoursesForUser.data.value.entries_get.entries
      .map((course) => setCourseItem(parseCourseForLP(course)));

    await setCoursesProgress(allCourses);
    return allCourses;
  }

  return [];
}

async function setCoursesProgress(courses) {
  const course_ids = courses.map((course) => course.id);
  const courses_progress = await getAllProgress(course_ids);

  courses.forEach((course) => {
    if (course.id in courses_progress) course.progress = courses_progress[course.id];
  });
}

function countMaterialProgress(material) {
  if (!material.is_course) {
    const sumCourses = material.courses.reduce((acc, course) => acc + course.progress, 0);
    const maxPercent = material.courses.length * 100;
    material.progress = Math.round((sumCourses / maxPercent) * 100);
  }
}

function setPathItem(path) {
  return {
    id: path.id,
    name: path.name,
    created_at: path.created_at,
    description: path.description,
    duration: path.duration,
    count_courses: path.count_courses,
    count_lessons: path.count_lessons,
    courses: path.courses.map((course) => setCourseItem(course)),
    progress: 0
  }
}

function setCourseItem(course) {
  return {
    id: course.id,
    name: course.name,
    is_course: true,
    created_at: course.created_at,
    description: course.description,
    duration: course.duration,
    count_lessons: course.count_lessons,
    banner: course.banner || DEFAULT_THUMBNAIL,
    progress: 0
  }
}

function onSelectCourse(item) {
  router.push({ path: `/lms/learning-materials/${item.id}` });
}

function onShowEnrolled() {
  showCompleted.value = false;
}

function onShowCompleted() {
  showCompleted.value = true;
}
</script>

<template>
  <div class="learning-materials">
    <div class="learning-materials__heading">
      <div class="learning-materials__heading-label">
        My Learning Material
      </div>
      <div class="learning-materials__heading-tools">
        <div class="learning-materials__heading-switcher">
          <button
            type="button"
            :class="['learning-materials__heading-btn', {'learning-materials__heading-btn--active': !showCompleted}]"
            @click="onShowEnrolled"
          >
            Enrolled ({{ materials.length + individualCourses.length }})
          </button>
          <button
            type="button"
            :class="['learning-materials__heading-btn', {'learning-materials__heading-btn--active': showCompleted}]"
            @click="onShowCompleted"
          >
            Completed ({{ completedItemsCounter }})
          </button>
        </div>
        <div class="learning-materials__heading-search">
          <SearchIcon />
          <input type="search" name="my-courses-search" placeholder="Search..." />
        </div>
      </div>
    </div>
    <div class="learning-materials__container">
      <div class="learning-materials-list">
        <div
          class="learning-materials-list__item"
          v-for="learningMaterial of (showCompleted ? completedMaterials : materials)"
          :key="learningMaterial.id"
        >
          <div
            v-if="!learningMaterial.is_course"
            class="learning-materials-list__container"
          >
            <div class="learning-materials-list__header">
              <div class="learning-materials-list__name">
                {{ learningMaterial.name }}
              </div>
              <div class="learning-materials-list__inside">
                <span>{{ learningMaterial.duration }} hours</span>
                <span>{{ learningMaterial.count_courses }} courses</span>
                <span>{{ learningMaterial.count_lessons }} lessons</span>
              </div>
              <div
                v-show="learningMaterial.description"
                class="learning-materials-list__description"
              >
                {{ learningMaterial.description }}
              </div>
            </div>
            <UserCoursesList
              :courses="learningMaterial.courses"
              @select-course="onSelectCourse"
            />
          </div>

          <UserCoursesItem
            v-else
            :course="learningMaterial"
            @select-course="onSelectCourse"
          />
        </div>

        <div
          v-if="showCompleted ? completedIndividualCourses.length : individualCourses.length"
          class="learning-materials-list__item"
        >
          <div class="learning-materials-list__container">
            <div class="learning-materials-list__header">
              <div class="learning-materials-list__name">
                Individual Material
              </div>
              <div class="learning-materials-list__inside">
                <span>{{ individualMaterialCountHours }} hours</span>
                <span>{{ individualMaterialCountCourses }} courses</span>
                <span>{{ individualMaterialCountLessons }} lessons</span>
              </div>
              <div class="learning-materials-list__description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eget porttitor urna.
                In gravida, orci vel pretium lobortis, lorem purus auctor mauris.
              </div>
            </div>
            <UserCoursesList
              :courses="(showCompleted ? completedIndividualCourses : individualCourses)"
              @select-course="onSelectCourse"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.learning-materials {
  background-color: #eff2f5;
  padding: 20px 40px;
  width: 100%;

  &__heading {
    margin-bottom: 25px;

    &-label {
      margin-bottom: 25px;
      font-weight: 700;
      font-size: 24px;
      color: #0B243D;
    }

    &-tools {
      display: flex;
      align-items: center;
      justify-content: space-between
    }

    &-switcher {}

    &-btn {
      padding: 10px 30px;
      margin-right: 15px;
      color: #101828;
      font-size: 14px;
      background-color: #fff;
      border-radius: 10px;

      &--active {
        background: #358DE8;
        color: #fff;
      }
    }

    &-search {
      border: 1px solid #D0D5DD;
      border-radius: 10px;
      padding: 12px 20px;
      background-color: #fff;

      svg {
        margin-right: 15px;
      }

      input[type="search"] {
        &::placeholder {
          color: #98A2B3;
          font-size: 14px;
        }

        &::-webkit-search-cancel-button {
          cursor: pointer;
        }
      }
    }
  }

  &__container {}

  &-list {
    &__item {
      margin-bottom: 35px;
    }

    &__container {
      background: #FFFFFF;
      border-radius: 10px;
    }

    &__header {
      padding: 35px 35px 0 35px;
    }

    &__name {
      color: #0B243D;
      font-weight: 700;
      font-size: 24px;
      margin-bottom: 12px;
    }

    &__inside {
      color: #A6B2C1;
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 8px;

      span {
        position: relative;
        padding-left: 14px;

        &::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 50%;
          width: 5px;
          height: 5px;
          background-color: #A6B2C1;
          border-radius: 50%;
          transform: translateY(-50%);
        }

        &:first-child {
          padding-left: unset;

          &::before {
            content: none;
          }
        }
      }
    }

    &__description {
      max-width: 70%;
      color: #0B243D;
      font-weight: 500;
      font-size: 14px;
    }
  }
}
</style>
