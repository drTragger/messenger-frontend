<template>
  <div>
    <DropDown
        v-model="selectedLanguage"
        :options="dropdownOptions"
        optionLabel="label"
        optionValue="code"
        class="language-selector"
        @change="changeLanguage"
        @show="dropdownOpen = true"
        @hide="dropdownOpen = false"
    >
      <template #dropdownicon>
        <i
            class="pi"
            :class="{
              'pi-chevron-down': !dropdownOpen,
              'pi-chevron-up': dropdownOpen
            }"
        ></i>
      </template>
    </DropDown>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";

export default {
  name: "LanguageSwitcher",
  setup() {
    const { locale } = useI18n();
    const selectedLanguage = ref(locale.value);
    const dropdownOpen = ref(false);

    // Available languages
    const languages = [
      { code: "en", label: "🇺🇸 English" },
      { code: "uk", label: "🇺🇦 Українська" },
      { code: "pl", label: "🇵🇱 Polski" },
    ];

    // Dropdown options
    const dropdownOptions = computed(() =>
        languages.map((lang) => ({
          code: lang.code,
          label: lang.label,
        }))
    );

    const changeLanguage = (lang) => {
      locale.value = lang.value; // Update Vue I18n locale
      selectedLanguage.value = lang.value; // Update selectedLanguage value
      localStorage.setItem("selectedLanguage", lang.value); // Persist the selected language
      window.location.reload();
    };

    // Ensure the label is correctly displayed when loading the component
    selectedLanguage.value = localStorage.getItem("selectedLanguage") || locale.value;

    return {
      selectedLanguage,
      dropdownOptions,
      changeLanguage,
      dropdownOpen,
    };
  },
};
</script>

<style scoped>
.language-selector {
  border: none !important;
  background: none !important;
  box-shadow: none !important;
}
</style>