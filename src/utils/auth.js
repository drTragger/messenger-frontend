import apiClient from "@/utils/api";
import {reactive} from "vue";

export const authStore = reactive({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    wsManager: null, // WebSocket Manager

    async login(token) {
        this.isAuthenticated = true;
        this.token = token;
        localStorage.setItem("token", token);

        await this.fetchUser();
    },

    logout() {
        this.isAuthenticated = false;
        this.token = null;
        this.user = null;
        localStorage.removeItem("token");
    },

    async fetchUser() {
        this.loading = true;
        try {
            const response = await apiClient.get("/auth/me", {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            });
            this.user = response.data.data;
        } catch (error) {
            console.error("Failed to fetch user:", error);
            this.logout();
        } finally {
            this.loading = false;
        }
    },

    initialize() {
        const token = localStorage.getItem("token");
        if (token) {
            this.token = token;
            this.isAuthenticated = true;
            this.fetchUser();
        }
    },
});

/**
 * Logout the user and redirect to the login page.
 *
 * @param {object} router - The Vue Router instance.
 */
export async function logoutUser(router) {
    try {
        // Retrieve token from localStorage
        const token = localStorage.getItem("token");
        if (!token) return;

        // Send the logout request to the backend
        await apiClient.post(
            "/logout",
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Clear token from localStorage
        authStore.logout()

        // Redirect to login page
        router.push({name: "LoginPage"});
    } catch (error) {
        console.error(
            "Logout failed:",
            error.response?.data?.message || error.message
        );
        alert("Failed to log out. Please try again.");
    }
}