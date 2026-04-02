import './assets/main.css'

import { createApp } from 'vue'
import TresPlugin from '@tresjs/core'
import App from './App.vue'

createApp(App).use(TresPlugin).mount('#app')
