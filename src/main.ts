import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import './style.css';
import 'maplibre-gl/dist/maplibre-gl.css'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// เรียก initAuth หลังจาก mount pinia แล้ว
const authStore = useAuthStore();
authStore.initAuth();

app.mount('#app');