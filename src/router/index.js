import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'

const routes = [
    {
        path: '/',
        name: 'HomePage',
        component: HomePage
    },
    {
        path: '/login',
        name: 'LoginPage',
        component: LoginPage
    },
    {
        path: '/register',
        name: 'RegisterPage',
        component: RegisterPage
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Middleware для перевірки авторизації
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('token') // Замість token використовуйте своє поле
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'Login' })
    } else {
        next()
    }
})

export default router