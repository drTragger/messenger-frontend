import { createApp } from 'vue'; // Correct import for Vue 3
import App from './App.vue';
import router from './router'; // Assuming you have a router setup
// import './assets/main.css'; // Optional: Your custom styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap icons
import "intl-tel-input/styles";

const app = createApp(App);

app.use(router); // Use the router if you have one
app.mount('#app');