<template>
  <div id="app">
    <!-- Header -->
    <header class="bg-gray-50 shadow-md flex items-center">
      <div class="container mx-auto flex justify-between items-center">
        <a href="/" class="flex items-center">
          <Image
              :src="require('@/assets/logo.webp')"
              :alt="appName + ' Logo'"
              image-class="w-8 mr-2"
          />
          <span class="text-lg font-bold">{{ appName }}</span>
        </a>
        <nav class="flex flex-row items-center flex-grow justify-end space-y-0 space-x-6 mt-0 list-none">
          <!-- Language Switcher -->
          <li class="flex flex-row items-center space-x-4" v-if="!isAuthenticated">
            <LanguageSwitcher/>
          </li>

          <!-- Login/Logout Links -->
          <li v-if="!isAuthenticated">
            <router-link to="/login" class="text-gray-600 hover:text-blue-600">
              {{ $t("login.button") }}
            </router-link>
          </li>
          <li v-if="!isAuthenticated">
            <router-link to="/register" class="text-gray-600 hover:text-blue-600">
              {{ $t("register.button") }}
            </router-link>
          </li>
          <li v-if="isAuthenticated" class="flex items-center space-x-4 text-gray-600 hover:text-blue-600">
            <router-link to="/settings" class="flex items-center justify-center">
              <i class="pi pi-cog text-2xl"></i>
            </router-link>
          </li>
        </nav>
      </div>
    </header>
    <!-- Main Content -->
    <main>
      <Toast/>
      <router-view/>
    </main>
  </div>
</template>

<script>
import {authStore} from "@/utils/auth";
import {useI18n} from "vue-i18n";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

export default {
  name: "App",
  components: {LanguageSwitcher},
  setup() {
    const {locale} = useI18n();
    return {locale, authStore};
  },
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
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
  },
  beforeUnmount() {
    const wsManager = getWebSocketManager(process.env.APP_VUE_WS_URL, authStore.token);
    wsManager.disconnect();
  },
  methods: {
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
body {
  font-family: "Arial", sans-serif;
}

header {
  height: var(--header-height);
}
</style>