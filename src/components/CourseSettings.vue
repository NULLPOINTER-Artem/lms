<script setup>
import { defineEmits, defineProps, onMounted, ref, reactive } from 'vue';
import { useClientHandle } from '@urql/vue';

// API
import {
  queryProjectRolesBody
} from '../API/queryBodies.js';

// Component-icons
import RoundedCloseIcon from './icons/RoundedCloseIcon.vue';
import UploadIcon from './icons/UploadIcon.vue';

const emit = defineEmits(['close-window', 'save-settings']);
const props = defineProps({
  currentCourse: {
    type: Object,
    required: true
  }
});

// Global
const handleClient = useClientHandle();

// State
const formData = ref({
  title: '',
  description: '',
  duration: {
    hours: 0,
    minute: 0
  },
  role: '',
  banner: {
    status: 'No file chosen',
    name: '',
    dataUrl: ''
  }
});

const queryProjectRolesVariables = reactive({
  project_id: localStorage.getItem('project_id'),
});
const queryProjectRoles = handleClient.useQuery({
  query: queryProjectRolesBody,
  pause: true,
  variables: queryProjectRolesVariables,
  context: {
    requestPolicy: 'network-only'
  }
});

onMounted(() => {
  let duration = null;

  queryProjectRoles.executeQuery();

  if (props.currentCourse.parsedCourse.duration) {
    const [hours, minutes] = props.currentCourse.parsedCourse.duration.split('/');
    duration = {
      hours: Number.parseInt(hours),
      minute: Number.parseInt(minutes)
    }
  }

  formData.value = {
    ...formData.value,
    title: props.currentCourse.parsedCourse.name,
    role: props.currentCourse.parsedCourse.role_id ?? '',
    duration: duration ? { ...duration } : {
      hours: 0,
      minute: 0
    },
    description: props.currentCourse.parsedCourse.description ?? '',
    banner: {
      name: props.currentCourse.parsedCourse.banner_name ?? '',
      dataUrl: props.currentCourse.parsedCourse.banner ?? '',
      status: 'No file chosen'
    }
  };
});

function onUploadArea(event) {
  event.stopPropagation();
  const fileInput = event.target.querySelector('input[name="banner"]');
  if (fileInput) fileInput.click();
}

function onFileUpload(event, fileData) {
  const fr = new FileReader();
  const file = event.target.files[0];
  fileData.status = 'Processing';

  fr.onload = () => {
    fileData.dataUrl = fr.result;
    fileData.name = file.name;
    fileData.status = 'No file chosen';
    event.target.value = '';
  }

  fr.readAsDataURL(file);
}

function onSave() {
  emit('save-settings', formData.value);
}

function onClose() {
  emit('close-window');
}
</script>

<template>
  <div class="course-settings">
    <div class="course-settings__heading">
      <div class="course-settings__heading-name">
        {{ props.currentCourse.name }} Settings
      </div>
      <div class="course-settings__heading-close" @click="onClose">
        <RoundedCloseIcon />
      </div>
    </div>
    <div class="course-settings__container">
      <div class="course-settings__form">
        <div class="course-settings__form-item">
          <div class="course-settings__form-input">
            <span class="course-settings__form-name">
              Title
            </span>
            <input type="text" name="title" v-model="formData.title" />
          </div>
        </div>
        <div class="course-settings__form-item">
          <div class="course-settings__form-textarea">
            <span class="course-settings__form-name">
              Description
            </span>
            <textarea
              type="text"
              name="description"
              v-model="formData.description"
            />
          </div>
        </div>
        <div class="course-settings__form-item">
          <div class="course-settings__form-label">
            Recommend Duration
          </div>
          <div class="course-settings__form-item__container">
            <div class="course-settings__form-select course-settings__form-item__container-item">
              <span class="course-settings__form-name">
                Hours
              </span>
              <input type="number" min="1" name="hours" v-model="formData.duration.hours" />
            </div>
            <div class="course-settings__form-select course-settings__form-item__container-item">
              <span class="course-settings__form-name">
                Minutes
              </span>
              <input type="number" min="1" max="59" name="minutes" v-model="formData.duration.minute" />
            </div>
          </div>
        </div>
        <div class="course-settings__form-item">
          <div class="course-settings__form-select">
            <span class="course-settings__form-name">
              Roles
            </span>
            <select
              v-if="queryProjectRoles.data.value"
              name="roles"
              v-model="formData.role"
            >
              <option
                v-for="role of queryProjectRoles.data.value.roles_project_get.roles"
                :key="role.id"
                :value="role.id"
              >
                {{ role.name[0].text_value }}
              </option>
            </select>
          </div>
        </div>
        <div class="course-settings__form-item">
          <div class="course-settings__form-label">
            Banner
          </div>
          <div class="course-settings__form-file">
            <button
              type="button"
              class="course-settings__form-file__container"
              @click="onUploadArea"
            >
              <UploadIcon
                class="course-settings__form-file__icon"
              />
              <input
                type="file"
                name="banner"
                data-placeholder="Choose a File"
                @change="onFileUpload($event, formData.banner)"
              />
            </button>
            <div :class="['course-settings__form-file__status', { 'course-settings__form-file--loaded': formData.banner.dataUrl }]">
              {{ formData.banner.dataUrl ? formData.banner.name : formData.banner.status }}
            </div>
          </div>
        </div>
      </div>
      <div class="course-settings__control">
        <button
          class="course-settings__control-btn"
          type="button"
          @click="onSave"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.course-settings {
  &__modal {
    &-container {
      max-height: 900px;
      max-width: 700px;
    }
  }

  &__heading {
    padding: 25px 0;
    border-bottom: 1px solid #D0D5DD;
    position: relative;
    margin-bottom: 40px;

    &-name {
      font-weight: 700;
      font-size: 24px;
      color: #0B243D;
    }

    &-close {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }

  &__container {}

  &__form {
    &-item {
      margin-bottom: 35px;
      min-width: 320px;

      &__container {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        &-item {
          margin-right: 15px;
          width: 25%;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    &-input,
    &-textarea,
    &-select {
      border: 1px solid #AEB4C2;
      border-radius: 10px;
      position: relative;
      padding: 14px 16px;

      input,
      textarea,
      select {
        width: 100%;
        resize: none;
        background: transparent;
      }
    }

    &-textarea {}

    &-select {
      select {
        min-width: 150px;

        option {
          text-transform: capitalize;
          font-weight: 500;
          font-size: 14px;
          color: #0B243D;
        }
      }
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
        background: transparent;
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

    &-name {
      position: absolute;
      left: 10px;
      top: -10px;
      background-color: #fff;
      font-weight: 500;
      font-size: 14px;
      color: #0B243D;
    }

    &-label {
      font-weight: 500;
      font-size: 14px;
      color: #101828;
      margin-bottom: 20px;
    }
  }

  &__control {
    &-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #358DE8;
      box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
      border-radius: 8px;
      padding: 12px 25px;
      color: #fff;
    }
  }
}
</style>
