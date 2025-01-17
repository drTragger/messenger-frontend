<template>
  <div id="app">
    <header class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container">
        <a href="/" class="navbar-brand d-flex align-items-center">
          <img
              :src="require('@/assets/logo.webp')"
              :alt="appName + ' Logo'"
              width="30"
              height="30"
              class="me-2"
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
            <!-- Language Switcher -->
            <li class="nav-item dropdown">
              <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="languageSwitcher"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
              >
                {{ currentLanguageWithFlag }}
              </a>
              <ul class="dropdown-menu" aria-labelledby="languageSwitcher">
                <li
                    v-for="lang in languages"
                    :key="lang.code"
                    class="dropdown-item d-flex align-items-center"
                    @click="changeLanguage(lang.code)"
                >
                  <span class="me-2">{{ lang.flag }}</span>
                  {{ lang.label }}
                </li>
              </ul>
            </li>

            <!-- Login/Logout Buttons -->
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/login" class="nav-link">
                {{ $t("login.button") }}
              </router-link>
            </li>
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/register" class="nav-link">
                {{ $t("register.button") }}
              </router-link>
            </li>
            <li class="nav-item d-flex justify-content-center align-items-center" v-if="isAuthenticated">
              <button
                  class="btn btn-outline-danger btn-sm d-flex align-items-center"
                  @click="logout"
              >
                <i class="bi bi-door-open me-2"></i> {{ $t('login.logout') }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
import {logoutUser, authStore} from "@/utils/auth";
import {useI18n} from "vue-i18n";
import {getWebSocketManager} from "@/utils/websocket/websocket";

export default {
  name: "App",
  setup() {
    const {locale} = useI18n();
    return {locale, authStore};
  },
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      languages: [
        {code: "en", label: "English", flag: "🇺🇸"},
        {code: "uk", label: "Українська", flag: "🇺🇦"},
        {code: "pl", label: "Polski", flag: "🇵🇱"},
      ],
    };
  },
  created() {
    authStore.initialize();
    this.setInitialLanguage();

    if (this.isAuthenticated && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.warn('Notification permission denied.');
        }
      });
    }
  },
  computed: {
    isAuthenticated() {
      return !!authStore.isAuthenticated;
    },
    currentLanguageWithFlag() {
      const lang = this.languages.find((lang) => lang.code === this.locale);
      return lang ? `${lang.flag} ${lang.label}` : "🌐 Select";
    },
  },
  beforeUnmount() {
    const wsManager = getWebSocketManager(process.env.APP_VUE_WS_URL, authStore.token);
    wsManager.disconnect();
  },
  methods: {
    async logout() {
      await logoutUser(this.$router);
      const wsManager = getWebSocketManager(process.env.APP_VUE_WS_URL, authStore.token);
      wsManager.disconnect();
    },
    changeLanguage(lang) {
      this.$i18n.locale = lang; // Correctly update locale
      localStorage.setItem("selectedLanguage", lang); // Persist language
      location.reload();
    },
    setInitialLanguage() {
      const savedLanguage = localStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        this.$i18n.locale = savedLanguage || 'uk';
      }
    },
  },
};
</script>

<style>
:root {
  --header-height: 56px;
}

body {
  font-family: "Arial", sans-serif;
}

header {
  height: var(--header-height);
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

#navbarNav li.dropdown-item {
  cursor: pointer;
}

#navbarNav li.dropdown-item span {
  font-size: 1.25rem; /* Increase flag size */
}
</style>