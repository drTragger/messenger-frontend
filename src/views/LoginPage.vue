<template>
  <div class="d-flex justify-content-center align-items-center container my-5" style="height: 80vh">
    <div class="card shadow-lg p-4" style="max-width: 400px; width: 100%;">
      <!-- Logo -->
      <div class="text-center mb-3">
        <img
            :src="require('@/assets/logo.webp')"
            :alt="appName + ' Logo'"
            class="img-fluid"
            style="max-width: 100px;"
        />
      </div>

      <!-- Title and Subtitle -->
      <div class="text-center mb-4">
        <h3 class="fw-bold">{{ $t('login.title', { appName: appName }) }}</h3>
        <p class="text-muted">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" novalidate>
        <!-- General Error -->
        <div v-if="generalError" class="alert alert-danger" role="alert">
          {{ generalError }}
        </div>

        <!-- Phone Input -->
        <div class="mb-3">
          <label for="phone" class="form-label">{{ $t('login.form.phone.label') }}</label>
          <PhoneInput
              v-model="phone"
              :is-invalid="!!validationErrors.phone"
              :errorMessage="validationErrors.phone"
              @validityChange="phoneIsValid = $event"
          />
        </div>

        <!-- Password Input -->
        <div class="mb-3">
          <label for="password" class="form-label">{{ $t('login.form.password.label') }}</label>
          <input
              v-model="password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.password }"
              id="password"
              :placeholder="$t('login.form.password.placeholder')"
              required
          />
          <div class="invalid-feedback">{{ validationErrors.password }}</div>
        </div>

        <!-- Login Button -->
        <button
            type="submit"
            class="btn btn-primary w-100 d-flex align-items-center justify-content-center"
            :disabled="loading"
        >
          <span v-if="!loading">{{ $t('login.button') }}</span>
          <span v-else>
            <i class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></i>
            {{ $t('loading') }}
          </span>
        </button>

        <div class="text-center mt-3">
          <small class="text-muted">
            {{ $t('login.noAccount') }}
            <router-link to="/register" class="text-primary text-decoration-none">{{
                $t('register.button')
              }}
            </router-link>
          </small>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from "@/api";
import PhoneInput from "@/components/PhoneInput.vue";
import { authStore } from "@/utils/auth";

export default {
  components: { PhoneInput },
  setup() {
    return { authStore };
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

          this.$router.push({ name: "HomePage" });
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
.spinner-border {
  width: 1rem;
  height: 1rem;
}
</style>