import {createApp} from 'vue'; // Correct import for Vue 3
import App from './App.vue';
import router from './router';
import i18n from './utils/i18n'

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap icons

// IntlTelInput imports
import "intl-tel-input/styles";

// PrimeVue imports
import PrimeVue from 'primevue/config';
import Lara from '@primevue/themes/lara';
import ContextMenu from 'primevue/contextmenu';
import 'primeicons/primeicons.css'

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(PrimeVue, {
    ripple: true,
    inputStyle: "outlined",
    theme: {
        preset: Lara,
        options: {
            darkModeSelector: false,
        }
    }
});
app.component(ContextMenu);
app.mount('#app');