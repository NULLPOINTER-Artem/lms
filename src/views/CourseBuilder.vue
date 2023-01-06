<script setup>
import { onBeforeMount, reactive, ref, triggerRef } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useClientHandle } from '@urql/vue';

// Helpers
import generateId from '../helpers/generateId.js';

// Store
import { roles, useUser } from '../stores/user.js';

// Hooks
import useParseCourse from '../hooks/useParseCourse.js';
import useCourseDeletion from '../hooks/useCourseDeletion.js';

// API
import {
  queryCourseBody,
} from '../API/queryBodies.js';
import {
  mutationUpdateCourseBody,
  mutationCreateSectionBody,
  mutationUpdateCourseSettingsBody
} from '../API/mutationBodies.js';
import { setElementValueInputEntry } from "../API/tools/common.js";

// Components
import ModalWindow from '../components/ModalWindow.vue';
import CourseSettings from '../components/CourseSettings.vue';
import CourseSection from '../components/CourseSection.vue';
import AddIcon from '../components/icons/AddIcon.vue';
import SettingsIcon from '../components/icons/SettingsIcon.vue';

// Global
const route = useRoute();
const handleClient = useClientHandle();

// Hooks
const { parseCourses, parseSection } = useParseCourse();
const { deleteSections } = useCourseDeletion();

const { role } = storeToRefs(useUser());

// State
const currentCourse = reactive({
  name: 'New Course',
  paths: '',
  sections: [],
  parsedCourse: {}
});
const toggleModal = ref(false);

// Mutations
const mutationUpdateCourse = handleClient.useMutation(mutationUpdateCourseBody);
const mutationUpdateCourseSettings = handleClient.useMutation(mutationUpdateCourseSettingsBody);

const mutationCreateSection = handleClient.useMutation(mutationCreateSectionBody);

// Queries
const queryCourseVariables = reactive({
  project_id: localStorage.getItem('project_id'),
  course_id: ''
});
const queryCourse = handleClient.useQuery({
  query: queryCourseBody,
  pause: true,
  variables: queryCourseVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

onBeforeMount(async () => {
  queryCourseVariables.course_id = route.params.id;

  const response = await queryCourse.executeQuery()
  currentCourse.parsedCourse = await parseCourses([response.data.value.entries_get.entries[0]])
    .then((res) => res[0]);

  const sections = currentCourse.parsedCourse.elements
    .find((element) => element.api_name.includes('element__sections__entry')).value;

  if (sections && sections.length) {
    sections.sort((a, b) => a.created_at - b.created_at);

    for (const section of sections) addSection(section);
  }
});

onBeforeRouteLeave((to, from, next) => {
  if (role.value === roles.ADMIN) {
    saveCourse().then(() => next());
  } else {
    next();
  }
});

function addSection(section) {
  const lessons = section.elements
    .find((element) => element.api_name.includes('element__lessons__entry')).value ?? [];

  currentCourse.sections.push({
    ...section,
    lessons,
  });
}

async function saveCourse() {
  const section_ids = currentCourse.sections.map((item) => item.id);

  await mutationUpdateCourse.executeMutation({
    project_id: localStorage.getItem('project_id'),
    course_id: currentCourse.parsedCourse.id,
    course_name: currentCourse.parsedCourse.name ?? "New Course",
    course_sections: section_ids.length ?
      setElementValueInputEntry(
        {
          id__in: section_ids
        }
      ) : {}
  });
}

function handleInputName(e) {
  currentCourse.parsedCourse.name = e.target.textContent;
}

function onAddSection() {
  const newId = generateId(Math.floor(Math.random() * 7) + 1);

  mutationCreateSection.executeMutation({
    project_id: localStorage.getItem('project_id'),
    section_api_name: `entry__section_${newId}`,
    section_name: `New Section`,
    section_description: '',
    section_lessons: {},
  }).then((response) => addSection(parseSection(response.data.entries_create[0])));
}

function onDeleteSection({ item, menuOptions, menuItem, refOnShallowRef }) {
  menuItem.load = true;
  triggerRef(refOnShallowRef);

  deleteSections([item.value]).then(() => {
    menuItem.load = false;
    triggerRef(refOnShallowRef);
    menuOptions.style.display = 'none';

    currentCourse.sections = currentCourse.sections
      .filter((sectionItem) => sectionItem.id !== item.value.id);
  });
}

function onToggleModal() {
  toggleModal.value = !toggleModal.value;
}

function onSaveSettings(formData) {
  const course_duration =
    String((Number.parseInt(formData.duration.hours) * 60) + Number.parseInt(formData.duration.minute));

  mutationUpdateCourseSettings.executeMutation({
    project_id: localStorage.getItem('project_id'),
    course_id: currentCourse.parsedCourse.id,
    role_id: formData.role,
    course_name: formData.title,
    course_banner: formData.banner.dataUrl,
    course_banner_name: formData.banner.name,
    course_duration,
    course_description: formData.description
  })
    .then(async (response) => {
      onToggleModal();
      const updatedCourse = await parseCourses([response.data.entries_update[0]])
        .then((response) => response[0]);

      currentCourse.parsedCourse = {
        ...currentCourse.parsedCourse,
        ...updatedCourse
      };
    });
}
</script>

<template>
  <modal-window
    v-if="toggleModal"
    :show-close="false"
    :class-style-window="'course-settings__modal'"
    :class-style-container="'course-settings__modal-container'"
    @close-window="onToggleModal"
  >
    <CourseSettings
      :current-course="currentCourse"
      @close-window="onToggleModal"
      @save-settings="onSaveSettings"
    />
  </modal-window>
  <div class="course-builder">
    <header class="course-builder__header">
      <div class="course-builder__label-container">
        <div
          class="course-builder__label"
          @input="handleInputName($event)"
          contenteditable="true"
        >
          {{ currentCourse.parsedCourse.name }}
        </div>
        <span class="course-builder__label-info">
          Included in Paths: {{ currentCourse.parsedCourse.course_paths }}
        </span>
      </div>
      <div class="course-builder__tools">
        <button
          type="button"
          class="course-builder__tools-btn course-builder__tools-btn--primary"
          @click="onAddSection"
        >
          <AddIcon />
          New Section
        </button>
        <button
          type="button"
          class="course-builder__tools-btn"
          @click="onToggleModal"
        >
          <SettingsIcon />
          Settings
        </button>
      </div>
    </header>
    <div
      v-if="currentCourse.sections.length"
      class="course-builder__sections"
    >
      <CourseSection
        v-for="section of currentCourse.sections"
        :key="section.id"
        :section="section"
        @delete-section="onDeleteSection"
      />
    </div>
    <div v-else class="course-builder__no-pages">
      There are no sections yet
    </div>
  </div>
</template>

<style lang="scss">
.course-builder {
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

    &-info {
      display: block;
      font-weight: 500;
      font-size: 14px;
      color: #0B243D;
    }
  }

  &__tools {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px 16px;
      border-radius: 10px;
      color: #0B243D;
      background: #FFFFFF;
      border: 1px solid #D0D5DD;
      margin-right: 15px;

      &:last-child {
        margin-right: 0;
      }

      svg {
        margin-right: 7px;
      }

      &--primary {
        color: #fff;
        background: #358DE8;
        border: 1px solid #358DE8;
      }
    }
  }

  &__sections {
    margin: 0 auto;
    background-color: #fff;
    border-radius: 10px;
  }

  &__no-pages {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #0B243D;
  }
}
</style>
