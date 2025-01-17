import { createI18n } from 'vue-i18n';

// Import translation files
import en from '@/locales/en';
import uk from '@/locales/uk';
import pl from '@/locales/pl';

const i18n = createI18n({
    legacy: false, // Use Composition API
    globalInjection: true, // Inject $t and $i18n globally
    locale: process.env.VUE_APP_LOCALE || 'uk', // Default language
    fallbackLocale: process.env.VUE_APP_FALLBACK_LOCALE || 'uk', // Fallback language
    messages: {
        en,
        uk,
        pl,
    },
});

export default i18n;