import { createApp } from 'vue';
import urql from '@urql/vue';

// Application components
import App from './App.vue';
import router from './router.js';
import store from './stores/index.js';
import { useAPIStore } from './stores/APIStore';

// Application styles
const bootstrap = () => import('bootstrap');
const bootstrapCSS = () => import('bootstrap/dist/css/bootstrap.css');
const bootstrapIcons = () => import('bootstrap-icons/font/bootstrap-icons.css');

// GraphQL settings
import { createClientURQL } from './API/URQL_client.config.js';

const app = createApp(App);

// Set Default API Settings
const APIStore = useAPIStore(store);
APIStore.setDomainAPI(`${import.meta.env.VITE_API_URL}`);
APIStore.setEndPointGraphQL('/api/graphql/v1/');
APIStore.setClient(createClientURQL(`${APIStore.getDomainAPI()}${APIStore.getEndPointGraphQL()}`));

// Application plugins
app.use(urql, APIStore.getClient())
.use(store)
.use(router);

// Waiting for resolve first routing logic before mount App component
router.isReady().then(() => {
  app.mount('#app');
  bootstrap();
  bootstrapCSS();
  bootstrapIcons();
});
