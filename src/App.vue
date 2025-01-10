<template>
  <div id="app">
    <header class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container">
        <a href="/" class="navbar-brand d-flex align-items-center">
          <img
              :src="require('@/assets/logo.png')"
              alt="Messenger Logo"
              width="30"
              height="30"
              class="d-inline-block align-text-top me-2"
          />
          <span>{{ appName }}</span>
        </a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link
                  to="/login"
                  class="nav-link"
                  v-if="!isAuthenticated"
              >
                {{ $t("login.button") }}
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                  to="/register"
                  class="nav-link"
                  v-if="!isAuthenticated"
              >
                {{ $t("register.button") }}
              </router-link>
            </li>
            <li class="nav-item">
              <button
                  v-if="isAuthenticated"
                  class="btn btn-outline-danger btn-sm d-flex align-items-center"
                  @click="logout"
                  title="Logout"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
              >
                <i class="bi bi-door-open me-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
    <main class="container my-5">
      <router-view/>
    </main>
  </div>
</template>

<script>
import {logoutUser} from "@/utils/auth";

export default {
  name: "App",
  data() {
    return {
      isAuthenticated: false,
      appName: process.env.VUE_APP_NAME,
    };
  },
  created() {
    this.checkAuth();
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = !!localStorage.getItem("token");
    },
    async logout() {
      await logoutUser(this.$router); // Use the utility function
      this.isAuthenticated = false; // Update local state
    },
  },
  watch: {
    $route() {
      this.checkAuth();
    },
  },
};
</script>

<style>
body {
  font-family: "Arial", sans-serif;
}

.navbar-brand span {
  font-size: 1.25rem;
  font-weight: bold;
}

.navbar-toggler {
  border-color: rgba(0, 0, 0, 0.1);
}

.navbar-toggler-icon {
  background-color: rgba(0, 0, 0, 0.5);
}

.nav-item button {
  margin-left: 10px;
  font-size: 0.875rem; /* Adjust button font size */
  display: inline-flex; /* Align icon and text */
  align-items: center;
}

.nav-item button i {
  font-size: 1rem; /* Adjust icon size */
}

.nav-item button:hover {
  background-color: #f8d7da; /* Light red background on hover */
  color: #721c24; /* Darker red text on hover */
}
</style>