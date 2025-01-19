<template>
  <div class="flex justify-center items-center container mx-auto my-10" style="height: 80vh">
    <div class="bg-white shadow-2xl rounded-lg p-6 w-full max-w-sm">
      <!-- Logo -->
      <div class="flex justify-center mb-4">
        <Image
            :src="require('@/assets/logo.webp')"
            :alt="appName + ' Logo'"
            imageClass="w-24 h-auto"
        />
      </div>

      <!-- Title and Subtitle -->
      <div class="text-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">{{ $t('login.title', {appName: appName}) }}</h3>
        <p class="text-gray-500">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" novalidate>
        <!-- General Error -->
        <Message
            v-if="generalError"
            severity="error"
            :content="generalError"
            class="mb-4"
        >
          {{ generalError }}
        </Message>

        <!-- Phone Input -->
        <div class="mb-4">
          <PhoneInput
              v-model="phone"
              :errorMessage="validationErrors.phone"
              @validityChange="phoneIsValid = $event"
          />
        </div>

        <!-- Password Input -->
        <div class="mb-4">
          <GeneralInput
              v-model="password"
              :label="$t('login.form.password.label')"
              :placeholder="$t('login.form.password.placeholder')"
              :error-message="validationErrors.password"
              id="password"
              type="password"
          />
        </div>

        <!-- Login Button -->
        <Button
            type="submit"
            :label="$t('login.button')"
            icon="pi pi-sign-in"
            class="w-full justify-center"
            :disabled="loading"
        >
          <template v-if="loading">
            <i class="pi pi-spin pi-spinner"></i>
            {{ $t('loading') }}
          </template>
        </Button>

        <!-- Register Link -->
        <div class="text-center mt-4">
          <p class="text-sm text-gray-500">
            {{ $t('login.noAccount') }}
            <router-link to="/register" class="text-blue-500 hover:underline">
              {{ $t('register.button') }}
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from "@/utils/api";
import PhoneInput from "@/components/PhoneInput.vue";
import {authStore} from "@/utils/auth";
import GeneralInput from "@/components/GeneralInput.vue";

export default {
  components: {GeneralInput, PhoneInput},
  setup() {
    return {authStore};
  },
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      phone: null,
      password: null,
      phoneIsValid: null,
      validationErrors: {},
      generalError: null,
      loading: false, // Loading state
    };
  },
  methods: {
    async login() {
      this.validationErrors = {};
      this.generalError = null;
      this.loading = true;

      try {
        const response = await apiClient.post("/login", {
          phone: this.phone,
          password: this.password,
        });

        if (response.data.success) {
          await authStore.login(response.data.data.token);

          this.$router.push({name: "HomePage"});
        }
      } catch (error) {
        if (error.response?.data?.fields) {
          this.validationErrors = error.response.data.fields;
        } else {
          this.generalError = error.response?.data?.message || this.$t("errors.unexpected");
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
