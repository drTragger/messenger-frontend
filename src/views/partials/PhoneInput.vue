<template>
  <div>
    <IntlTelInput
        class="form-control"
        :class="{ 'is-invalid': isInvalid }"
        :options="{
          initialCountry: 'ua',
          onlyCountries: onlyCountries,
          separateDialCode: true,
          strictMode: true,
          containerClass: 'w-100',
          i18n: countryTranslations
        }"
        @changeNumber="updateNumber"
        @changeValidity="updateValidity"
    />
    <div v-if="isInvalid && errorMessage" class="invalid-feedback d-block">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import IntlTelInput from "intl-tel-input/vueWithUtils";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "PhoneInput",
  components: { IntlTelInput },
  props: {
    modelValue: {
      type: [String, null],
      required: true,
    },
    isInvalid: {
      type: Boolean,
      default: false,
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
  setup(props, { emit }) {
    const { t } = useI18n();

    // Provide translations for country names
    const countryTranslations = computed(() => ({
      ua: t("countries.ua"),
      us: t("countries.us"),
      pl: t("countries.pl"),
    }));

    // Emit changes to parent
    const updateNumber = (value) => {
      emit("update:modelValue", value);
    };

    const updateValidity = (isValid) => {
      emit("validityChange", isValid);
    };

    return {
      countryTranslations,
      updateNumber,
      updateValidity,
    };
  },
});
</script>

<style scoped>
.invalid-feedback {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
</style>