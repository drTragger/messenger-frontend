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
        <h3 class="text-xl font-bold text-gray-900">{{ $t('register.title') }}</h3>
        <p class="text-gray-500">{{ $t('register.subtitle', { appName: appName }) }}</p>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="register" novalidate>
        <!-- General Error -->
        <Message
            v-if="generalError"
            severity="error"
            :content="generalError"
            class="mb-4"
        >
          {{ generalError }}
        </Message>

        <!-- Username Input -->
        <div class="mb-4">
          <GeneralInput
              v-model="username"
              :label="$t('register.form.username.label')"
              :placeholder="$t('register.form.username.placeholder')"
              :error-message="validationErrors.username"
              id="username"
              type="text"
          />
        </div>

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

        <!-- Register Button -->
        <Button
            type="submit"
            :label="$t('register.button')"
            icon="pi pi-user-plus"
            class="w-full justify-center"
            :disabled="loading"
        >
          <template v-if="loading">
            <i class="pi pi-spin pi-spinner"></i>
            {{ $t('loading') }}
          </template>
        </Button>

        <!-- Login Link -->
        <div class="text-center mt-4">
          <p class="text-sm text-gray-500">
            {{ $t('register.haveAccount') }}
            <router-link to="/login" class="text-blue-500 hover:underline">
              {{ $t('login.button') }}
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
import GeneralInput from "@/components/GeneralInput.vue";
import {authStore} from "@/utils/auth";

export default {
  components: {GeneralInput, PhoneInput},
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      username: null,
      phone: null,
      password: null,
      phoneIsValid: null,
      validationErrors: {}, // Object to store validation errors
      generalError: null, // For non-field-specific errors
      loading: false,
    };
  },
  methods: {
    async register() {
      this.validationErrors = {}; // Clear previous errors
      this.loading = true;

      try {
        if (!this.phoneIsValid) {
          this.validationErrors.phone = this.$t('validation.phone.invalid');
          return;
        }

        const response = await apiClient.post("/register", {
          username: this.username,
          phone: this.phone,
          password: this.password,
        });

        if (response.data.success) {
          authStore.user = response.data.data;
          this.$router.push({name: "PhoneVerificationPage", query: { phone: this.phone, username: this.username },});
        }
      } catch (error) {
        if (error.response?.data?.fields) {
          this.validationErrors = error.response.data.fields; // Field-specific errors
        } else if (error.response?.data?.message) {
          this.generalError = error.response.data.message; // General error message
        } else {
          this.generalError = this.$t('errors.unexpected');
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
