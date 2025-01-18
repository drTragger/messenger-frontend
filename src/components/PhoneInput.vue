<template>
  <div>
    <label for="phone" class="block text-sm font-medium text-gray-700">{{ $t('login.form.phone.label') }}</label>
    <IntlTelInput
        class="block w-full py-2 border rounded-md intl-tel-input"
        :class="{ 'p-invalid': !!localErrorMessage }"
        :options="{
          initialCountry: 'ua',
          onlyCountries: this.onlyCountries,
          separateDialCode: true,
          strictMode: true,
          containerClass: 'w-full mt-1',
          i18n: countryTranslations
        }"
        @changeNumber="onNumberChange"
        @changeValidity="updateValidity"
    />
    <Message v-if="localErrorMessage" severity="error" variant="simple" size="small">{{ localErrorMessage }}</Message>
  </div>
</template>

<script>
import {computed, defineComponent, ref, watch} from "vue";
import IntlTelInput from "intl-tel-input/vueWithUtils";
import {useI18n} from "vue-i18n";

export default defineComponent({
  name: "PhoneInput",
  components: {IntlTelInput},
  props: {
    modelValue: {
      type: [String, null],
      required: true,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    onlyCountries: {
      type: Array,
      default: () => ["ua", "us", "pl"],
    },
  },
  emits: ["update:modelValue", "validityChange"],
  setup(props, {emit}) {
    const {t} = useI18n();
    const localErrorMessage = ref(props.errorMessage);

    // Provide translations for country names
    const countryTranslations = computed(() => ({
      ua: t("countries.ua"),
      us: t("countries.us"),
      pl: t("countries.pl"),
      searchPlaceholder: t("countries.searchPlaceholder"),
    }));

    // Watch for external error message updates
    watch(
        () => props.errorMessage,
        (newMessage) => {
          localErrorMessage.value = newMessage;
        }
    );

    // Handle number changes
    const onNumberChange = (value) => {
      localErrorMessage.value = ""; // Clear error on input
      emit("update:modelValue", value);
    };

    // Handle validity updates
    const updateValidity = (isValid) => {
      emit("validityChange", isValid);
    };

    return {
      countryTranslations,
      onNumberChange,
      updateValidity,
      localErrorMessage,
    };
  },
});
</script>