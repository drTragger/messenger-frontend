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

export function isEmoji(charCode) {
    return (
        (charCode >= 0x1f300 && charCode <= 0x1f5ff) || // Miscellaneous Symbols and Pictographs
        (charCode >= 0x1f600 && charCode <= 0x1f64f) || // Emoticons
        (charCode >= 0x1f680 && charCode <= 0x1f6ff) || // Transport and Map Symbols
        (charCode >= 0x1f700 && charCode <= 0x1f77f) || // Alchemical Symbols
        (charCode >= 0x1f780 && charCode <= 0x1f7ff) || // Geometric Shapes Extended
        (charCode >= 0x1f800 && charCode <= 0x1f8ff) || // Supplemental Arrows-C
        (charCode >= 0x1f900 && charCode <= 0x1f9ff) || // Supplemental Symbols and Pictographs
        (charCode >= 0x1fa00 && charCode <= 0x1fa6f) || // Chess Symbols
        (charCode >= 0x1fa70 && charCode <= 0x1faff) || // Symbols and Pictographs Extended-A
        (charCode >= 0x2600 && charCode <= 0x26ff) || // Miscellaneous Symbols
        (charCode >= 0x2700 && charCode <= 0x27bf)    // Dingbats
    );
}