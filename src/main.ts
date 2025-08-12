import './assets/main.css'
// Import DB UI styles - using rollup version for proper asset paths
import '@db-ux/core-components/build/styles/rollup.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
