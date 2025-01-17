import {createRouter, createWebHistory} from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import ChatPage from '@/views/ChatPage.vue'
import {authStore} from "@/utils/auth";

const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage,
        meta: {requiresAuth: true},
    },
    {
        path: '/chats/:chatId',
        name: 'ChatPage',
        component: ChatPage,
        meta: {requiresAuth: true}, // Protect the route
    },
    {
        path: '/login',
        name: 'LoginPage',
        component: LoginPage,
    },
    {
        path: '/register',
        name: 'RegisterPage',
        component: RegisterPage,
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
});

export default router