<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 80vh">
    <div class="card shadow-lg p-4" style="max-width: 400px; width: 100%;">
      <div class="text-center mb-4">
        <h3 class="fw-bold">{{ $t('login.title', {appName: appName}) }}</h3>
        <p class="text-muted">{{ $t('login.subtitle') }}</p>
      </div>
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
        <button type="submit" class="btn btn-primary w-100">{{ $t('login.button') }}</button>
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
import "whatwg-fetch";
import PhoneInput from "@/views/partials/PhoneInput.vue"

export default {
  components: {PhoneInput},
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      phone: null,
      password: null,
      phoneIsValid: null,
      validationErrors: {},
      generalError: null, // For non-field-specific errors
    };
  },
  methods: {
    async login() {
      this.validationErrors = {};
      this.generalError = null;

      // Validate phone number
      if (!this.phoneIsValid) {
        this.validationErrors.phone = this.$t('validation.phone.invalid');
        return;
      }

      try {
        const response = await apiClient.post("/login", {
          phone: this.phone,
          password: this.password,
        });

        // Login successful
        if (response.data.success) {
          localStorage.setItem("token", response.data.data.token);
          this.$router.push({name: "HomePage"});
        }
      } catch (error) {
        // Handle validation and general errors
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