import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')

const API_URL = "https://web-classes-backend.onrender.com/api";
