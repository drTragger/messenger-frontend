<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 80vh">
    <div class="card shadow-lg p-4" style="max-width: 400px; width: 100%;">
      <div class="text-center mb-4">
        <h3 class="fw-bold">{{ $t('register.title') }}</h3>
        <p class="text-muted">{{ $t('register.subtitle', {appName: appName}) }}</p>
      </div>
      <form @submit.prevent="register" novalidate>
        <div v-if="generalError" class="alert alert-danger" role="alert">
          {{ generalError }}
        </div>
        <div class="mb-3">
          <label for="username" class="form-label">{{ $t('register.form.username.label') }}</label>
          <input
              v-model="username"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.username }"
              id="username"
              :placeholder="$t('register.form.username.placeholder')"
              required
          />
          <!-- Display username error -->
          <div class="invalid-feedback">{{ validationErrors.username }}</div>
        </div>
        <div class="mb-3">
          <label for="phone" class="form-label">{{ $t('register.form.phone.label') }}</label>
          <PhoneInput
              v-model="phone"
              :is-invalid="!!validationErrors.phone"
              :errorMessage="validationErrors.phone"
              @validityChange="phoneIsValid = $event"
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">{{ $t('register.form.password.label') }}</label>
          <input
              v-model="password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.password }"
              id="password"
              :placeholder="$t('register.form.password.placeholder')"
              required
          />
          <!-- Display password error -->
          <div class="invalid-feedback">{{ validationErrors.password }}</div>
        </div>
        <button type="submit" class="btn btn-primary w-100">{{ $t('register.button') }}</button>
        <div class="text-center mt-3">
          <small class="text-muted">
            {{ $t('register.haveAccount') }}
            <router-link to="/login" class="text-primary text-decoration-none">{{ $t('login.button') }}</router-link>
          </small>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from "@/api";
import PhoneInput from "@/views/partials/PhoneInput.vue";

export default {
  components: {PhoneInput},
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      username: null,
      phone: null,
      password: null,
      phoneIsValid: null,
      validationErrors: {}, // Object to store validation errors
      generalError: null, // For non-field-specific errors
    };
  },
  methods: {
    async register() {
      this.validationErrors = {}; // Clear previous errors
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
          this.$router.push({name: "LoginPage"});
        }
      } catch (error) {
        if (error.response?.data?.fields) {
          this.validationErrors = error.response.data.fields; // Field-specific errors
        } else if (error.response?.data?.message) {
          this.generalError = error.response.data.message; // General error message
        } else {
          this.generalError = this.$t('errors.unexpected');
        }
      }
    },
  },
};
</script>

<style scoped>
.form-label {
  margin-bottom: 5px;
  display: block;
}

.alert {
  padding: 0.75rem 1.25rem;
}
</style>