import {createApp} from 'vue'; // Correct import for Vue 3
import App from './App.vue';
import router from './utils/router';
import i18n from './utils/i18n'

// IntlTelInput imports
import "intl-tel-input/styles";

// Tailwind imports
import './assets/css/tailwind.css';

// PrimeVue imports
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice';

// PrimeVue components imports
import ContextMenu from 'primevue/contextmenu';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import DropDown from 'primevue/select';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Image from 'primevue/image';
import Toast from 'primevue/toast';

const app = createApp(App);

app.use(router)
    .use(i18n)
    .use(PrimeVue, {
        ripple: true,
        inputStyle: "outlined",
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: false,
            }
        },
    })
    .use(ToastService);

app.component('ContextMenu', ContextMenu)
    .component('Button', Button)
    .component('InputText', InputText)
    .component('Message', Message)
    .component('DropDown', DropDown)
    .component('InputTextarea', Textarea)
    .component('DialogWindow', Dialog)
    .component('Image', Image)
    .component('Toast', Toast);

app.mount('#app');