<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-white">
    <!-- Header -->
    <PageHeader :title="$t('phoneVerify.title')" :subtitle="$t('phoneVerify.subtitle')"/>

    <!-- Form Section -->
    <div class="w-full max-w-md bg-white shadow-2xl rounded-lg p-6">
      <form @submit.prevent="submitVerificationCode" class="space-y-6">
        <!-- Instructions -->
        <p class="text-center text-gray-600 mb-4">
          {{ $t('phoneVerify.instructions') }}<br>
          {{ route.query.phone }}
        </p>

        <Message
            v-if="generalError"
            severity="error"
            :content="generalError"
            class="mb-4"
        >
          {{ generalError }}
        </Message>

        <!-- Code Input -->
        <div class="flex flex-col align-middle">
          <div class="flex justify-between items-center space-x-2">
            <input
                v-for="(digit, index) in code"
                :key="index"
                type="text"
                maxlength="1"
                v-model="code[index]"
                @input="onInput(index)"
                @keydown.delete="onBackspace(index)"
                class="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:ring-blue-500 focus:border-blue-500"
                :ref="(el) => (inputRefs[index] = el)"
            />
          </div>
          <Message v-if="validationErrors.code" class="mt-1" severity="error" variant="simple" size="small">
            {{ validationErrors.code }}
          </Message>
        </div>

        <!-- Submit Button -->
        <Button :loading="loading" type="submit" class="p-button-primary w-full">
          {{ $t('phoneVerify.submit') }}
        </Button>

        <!-- Resend Code -->
        <div>
          <p v-if="resendCountdown" class="text-sm text-center text-gray-500 mt-4">
            {{ $t('phoneVerify.resendHint', {count: resendCountdown}) }}
          </p>
          <div class="flex justify-center items-center">
            <Button
                type="button"
                class="p-button p-button-transparent"
                :disabled="resendCountdown"
                @click="resendCode"
            >
              {{ $t('phoneVerify.resend') }}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import {ref, reactive, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import apiClient from "@/utils/api";
import PageHeader from "@/components/PageHeader.vue";
import Button from "primevue/button";
import {authStore} from "@/utils/auth";

export default {
  components: {PageHeader, Button},
  setup() {
    const {t} = useI18n();
    const route = useRoute(); // Access the current route
    const router = useRouter();

    // Reactive state
    const code = reactive(["", "", "", "", "", ""]);
    const inputRefs = ref([]); // References to input elements
    const loading = ref(false);
    const resendDisabled = ref(true); // Disable resend button initially
    const resendCountdown = ref(30); // 30 seconds countdown
    const generalError = ref(null);
    const validationErrors = ref({});

    let resendInterval;

    const submitVerificationCode = async () => {
      loading.value = true;
      try {
        const verificationCode = code.join("");

        if (verificationCode.length < 6) {
          validationErrors.value.code = t('validation.required');
          return;
        }

        // API call to verify the code
        await apiClient.post('/phone/verify', {code: verificationCode, phone: route.query.phone});
        await router.push({name: 'HomePage'});
      } catch (error) {
        if (error.response?.data?.fields) {
          validationErrors.value = error.response.data.fields; // Field-specific errors
        } else if (error.response?.data?.message) {
          generalError.value = error.response.data.message; // General error message
        } else {
          generalError.value = t('errors.unexpected');
        }
      } finally {
        loading.value = false;
      }
    };

    const onInput = (index) => {
      if (code[index].length === 1 && index < code.length - 1) {
        focusNextInput(index);
      }
    };

    const onBackspace = (index) => {
      if (!code[index] && index > 0) {
        focusPreviousInput(index);
      }
    };

    const focusNextInput = (index) => {
      const nextInput = inputRefs.value[index + 1];
      if (nextInput) nextInput.focus();
    };

    const focusPreviousInput = (index) => {
      const previousInput = inputRefs.value[index - 1];
      if (previousInput) previousInput.focus();
    };

    const startCountdown = () => {
      if (resendInterval) {
        clearInterval(resendInterval);
      }

      const now = Date.now();
      const remainingTime = localStorage.getItem('resendCountdownExpiry')
          ? Math.ceil((localStorage.getItem('resendCountdownExpiry') - now) / 1000)
          : 30;

      if (remainingTime > 0) {
        resendCountdown.value = remainingTime;
        resendDisabled.value = true;

        resendInterval = setInterval(() => {
          resendCountdown.value--;

          if (resendCountdown.value <= 0) {
            clearInterval(resendInterval);
            resendDisabled.value = false;
            localStorage.removeItem('resendCountdownExpiry'); // Clear after countdown ends
          }
        }, 1000);

        // Save the countdown expiry time
        localStorage.setItem('resendCountdownExpiry', now + remainingTime * 1000);
      } else {
        resendDisabled.value = false;
        resendCountdown.value = 0;
      }
    };

    const resendCode = async () => {

      generalError.value = null;
      validationErrors.value = {};

      let phone = route.query.phone;
      let username = route.query.username;

      if (phone.length < 1 || username.length < 1) {
        phone = authStore.user.phone;
        username = authStore.user.username;
      }

      try {
        await apiClient.post('/phone/verify/resend', {phone: phone, username: username});

        localStorage.setItem('resendCountdownExpiry', Date.now() + 30 * 1000);
        startCountdown();
      } catch (error) {
        if (error.response?.data?.message) {
          generalError.value = error.response.data.message;
        } else {
          generalError.value = t('errors.unexpected');
        }

        // Reset countdown in case of error
        resendCountdown.value = 0;
        resendDisabled.value = false;
        clearInterval(resendInterval);
        localStorage.removeItem("resendCountdownExpiry");
      }
    };

    onMounted(() => {
      startCountdown(); // Start countdown when the page is loaded
      if (inputRefs.value[0]) {
        inputRefs.value[0].focus(); // Focus on the first input
      }
    });

    return {
      t,
      code,
      inputRefs,
      loading,
      route,
      router,
      resendDisabled,
      resendCountdown,
      generalError,
      validationErrors,
      apiClient,
      submitVerificationCode,
      onInput,
      onBackspace,
      resendCode,
    };
  },
};
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>