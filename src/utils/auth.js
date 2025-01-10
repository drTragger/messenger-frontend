import apiClient from "@/api";

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
        localStorage.removeItem("token");

        // Redirect to login page
        router.push({ name: "LoginPage" });
    } catch (error) {
        console.error(
            "Logout failed:",
            error.response?.data?.message || error.message
        );
        alert("Failed to log out. Please try again.");
    }
}