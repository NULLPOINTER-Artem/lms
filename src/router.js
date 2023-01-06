import { createApp, h } from 'vue/dist/vue.esm-bundler.js';
import { createRouter, createWebHistory } from 'vue-router';
import { storeToRefs } from 'pinia';
import urql from '@urql/vue';

// Components
const HomeView = () => import('./views/HomeView.vue');
const LessonsView = () => import('./views/LessonsView.vue');
const LessonBuilder = () => import('./views/LessonBuilder.vue');
const CoursesView = () => import('./views/CoursesView.vue');
const CourseBuilder = () => import('./views/CourseBuilder.vue');
const LearningPathsView = () => import('./views/LearningPathsView.vue');
const EditLearningPath = () => import('./views/EditLearningPath.vue');
const LessonView = () => import('./views/LessonView.vue');
const LearningMaterialsView = () => import('./views/LearningMaterialsView.vue');
const CourseView = () => import('./views/CourseView.vue');

// Views
import LoadingData from './views/LoadingData.vue';

// Store
import store from './stores/index.js';
import { roles, useUser } from './stores/user.js';
import { useAPIStore } from './stores/APIStore';

// API
import { setToken, setUserInfo } from './API/user';

const routes_admin = [
  // Lesson routes
  {
    path: '/lms/lessons',
    name: 'lessonsView',
    component: LessonsView,
    meta: {
      title: 'LMS - Lessons'
    }
  },
  {
    path: '/lms/lessons/:id/edit',
    name: 'lessonsEdit',
    component: LessonBuilder,
    meta: {
      title: 'LMS - Edit Lesson'
    }
  },
  // Course routes
  {
    path: '/lms/courses',
    name: 'coursesView',
    component: CoursesView,
    meta: {
      title: 'LMS - Courses'
    }
  },
  {
    path: '/lms/courses/:id/edit',
    name: 'coursesEdit',
    component: CourseBuilder,
    meta: {
      title: 'LMS - Edit Course'
    }
  },
  // LP (Learning Paths) routes
  {
    path: '/lms/learning-paths',
    name: 'learningPaths',
    component: LearningPathsView,
    meta: {
      title: 'LMS - Learning Paths'
    }
  },
  {
    path: '/lms/learning-paths/:id/edit',
    name: 'learningPathsEdit',
    component: EditLearningPath,
    meta: {
      title: 'LMS - Edit Learning Path'
    }
  },
];

const routes_user = [
  // Lesson routes
  {
    path: '/lms/lesson-view/:id',
    name: 'lessonView',
    component: LessonView,
    meta: {
      title: 'LMS - Lesson'
    }
  },
  // Course routes
  {
    path: '/lms/learning-materials',
    name: 'learningMaterials',
    component: LearningMaterialsView,
    meta: {
      title: 'LMS - Learning Materials'
    }
  },
  {
    path: '/lms/learning-materials/:id',
    name: 'learningMaterialView',
    component: CourseView,
    meta: {
      title: 'LMS - Course'
    }
  }
];

export const routes = [
  {
    path: '/lms/knowledgebase',
    name: 'knowledgebase',
    component: HomeView,
    meta: {
      title: 'LMS - Knowledgebase'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: {
      name: 'knowledgebase'
    }
  },
  ...routes_admin,
  ...routes_user
];

export const userRoutes = routes_user.map((route) => route.name);
export const adminRoutes = routes_admin.map((route) => route.name);

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const { role } = storeToRefs(useUser(store));
  const userStore = useUser();

  if (!localStorage.getItem('user_id') || !localStorage.getItem('token')) {
    await setToken();
    await setUserInfo();

    const user_id = localStorage.getItem('user_id');
    await getUsefulData(user_id, userStore);
  } else if (!localStorage.getItem('project_id')) {
    const user_id = localStorage.getItem('user_id');
    await getUsefulData(user_id, userStore);
  }

  checkGuardRoute(role, to, next);
});

function checkGuardRoute(role, to, next) {
  if (
    adminRoutes.includes(to.name) && role.value === roles.USER ||
    userRoutes.includes(to.name) && role.value === roles.ADMIN
  ) {
    next('/');
  } else {
    next();
  }
}

async function getUsefulData(user_id, userStore) {
  await new Promise((resolve) => {
    const APIStore = useAPIStore();

    let instance = createApp({
      render: () => h(LoadingData),
      beforeCreate: () => {
        userStore.getUserData(user_id).then(() => {
          resolve(); // Resolve the main promise and exec next route
          instance.unmount(); // After successful fetching the useful data - unmount the Vue component from DOM
          instance = null; // Delete component object from memory
        });
      }
    })
      .use(urql, APIStore.getClient());

    instance.mount('#app'); // trigger the Vue component creation
  });
}

export default router;
