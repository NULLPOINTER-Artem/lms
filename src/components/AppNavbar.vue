<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

// Store
import { useUser, roles } from '../stores/user.js';

// Router
import { adminRoutes, userRoutes } from '../router.js';

// Utils
import { migrateDB } from '../utils.js';

// Global
const route = useRoute();
const router = useRouter();

// Stores
const storeUser = useUser();

// Store Refs
const { role } = storeToRefs(useUser());

// State
const processMigrate = ref(false);

function onChangeRole() {
  if (role.value === roles.ADMIN) {
    storeUser.changeRole(roles.USER);
    if (adminRoutes.includes(route.name)) router.push('/lms/knowledgebase');
  } else {
    storeUser.changeRole(roles.ADMIN);
    if (userRoutes.includes(route.name)) router.push('/lms/knowledgebase');
  }
}
async function onDBMigration() {
  processMigrate.value = true;
  await migrateDB();
  processMigrate.value = false;
}
</script>

<template>
  <nav class="app-nav">
    <div
      v-if="role === roles.ADMIN"
      class="app-nav__part"
    >
      <router-link class="app-nav__item" to="/lms/courses">
        Courses
      </router-link>
      <router-link class="app-nav__item" to="/lms/lessons">
        Lessons
      </router-link>
      <router-link class="app-nav__item" to="/lms/learning-paths">
        Learning Paths
      </router-link>
    </div>
    <div
      v-else
      class="app-nav__part"
    >
      <router-link class="app-nav__item" to="/lms/learning-materials">
        My Learning Material
      </router-link>
    </div>
    <div class="app-nav__part">
      <button
        type="button"
        class="app-nav__item app-nav__item--btn"
        :disabled="processMigrate"
        @click="onDBMigration"
      >
        DB Migration
      </button>
      <button
        type="button"
        class="app-nav__item app-nav__item--btn"
        @click="onChangeRole"
      >
        {{ storeUser.role }}
      </button>
      <router-link class="app-nav__item" to="/lms/knowledgebase">
        Knowledgebase
      </router-link>
    </div>
  </nav>
</template>

<style lang="scss">
.app-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #001;
  background-color: #fff;

  &__part {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__item {
    cursor: pointer;
    padding: 5px 15px;
    color: #0B243D;
    text-decoration: none;
    transition: all 0.1s ease-in-out;

    &.router-link-exact-active {
      transform: scale(1.1);
      color: #0a58ca;
    }

    &:hover {
      transform: scale(1.1);
    }

    &--btn {
      background: #358DE8;
      color: #fff;
      font-size: 14px;
      border-radius: 10px;
      margin-right: 15px;

      &:disabled {
        background-color: #98A2B3;
      }
    }
  }
}
</style>
