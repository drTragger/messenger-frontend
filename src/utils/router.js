import {createRouter, createWebHistory} from 'vue-router'
import i18n from '@/utils/i18n';
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import ChatPage from '@/views/ChatPage.vue'
import {authStore} from "@/utils/auth";
import SettingsPage from "@/views/SettingsPage.vue";
import PhoneVerificationPage from "@/views/PhoneVerificationPage.vue";

const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage,
        meta: {
            title: i18n.global.t('chat.title', { count: 2 }),
            requiresAuth: true
        },
    },
    {
        path: '/chats/:chatId',
        name: 'ChatPage',
        component: ChatPage,
        meta: {
            title: i18n.global.t('chat.title', { count: 1 }),
            requiresAuth: true
        },
    },
    {
        path: '/settings',
        name: 'SettingsPage',
        component: SettingsPage,
        meta: {
            title: i18n.global.t('settings.title'),
            requiresAuth: true
        },
    },
    {
        path: '/login',
        name: 'LoginPage',
        component: LoginPage,
        meta: {
            title: i18n.global.t('login.title', {appName: process.env.VUE_APP_NAME}),
        },
    },
    {
        path: '/register',
        name: 'RegisterPage',
        component: RegisterPage,
        meta: {
            title: i18n.global.t('register.title'),
        },
    },
    {
        path: '/phone-verify',
        name: 'PhoneVerificationPage',
        component: PhoneVerificationPage,
        meta: {
            title: i18n.global.t('phoneVerify.title'),
        },
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await authStore.fetchUser();
                next();
            } catch {
                next({name: 'LoginPage'});
            }
        } else {
            next({name: 'LoginPage'});
        }
    } else {
        next();
    }
    document.title = to.meta.title || "Default Title";
});

export default router