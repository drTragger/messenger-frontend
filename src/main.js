import { createApp } from 'vue'; // Correct import for Vue 3
import App from './App.vue';
import router from './router';
import i18n from './i18n'

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap icons
import "intl-tel-input/styles";

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');