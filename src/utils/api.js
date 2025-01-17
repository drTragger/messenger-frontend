import axios from 'axios';
import i18n from '@/utils/i18n';

const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to dynamically set the Accept-Language header
apiClient.interceptors.request.use(
    (config) => {
        // Dynamically set the Accept-Language header based on the current locale
        config.headers['Accept-Language'] = i18n.global.locale.value || process.env.VUE_APP_FALLBACK_LOCALE;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;