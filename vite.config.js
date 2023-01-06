import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import Components from 'unplugin-vue-components/vite'
import eslintPlugin from 'vite-plugin-eslint';
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: '',
      filename: 'service-worker.js',
      manifest
    }),
    Components(),
    eslintPlugin({ cache: false })
  ],
});
