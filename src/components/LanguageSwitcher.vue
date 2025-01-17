<template>
  <div>
    <!-- Navbar Variant -->
    <li
        v-if="variant === 'navbar'"
        class="nav-item dropdown"
    >
      <a
          class="nav-link dropdown-toggle"
          href="#"
          id="languageSwitcher"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
      >
        {{ currentLanguageWithFlag }}
      </a>
      <ul class="dropdown-menu" aria-labelledby="languageSwitcher">
        <li
            v-for="lang in languages"
            :key="lang.code"
            class="dropdown-item d-flex align-items-center"
            @click="changeLanguage(lang.code)"
        >
          <span class="me-2">{{ lang.flag }}</span>
          {{ lang.label }}
        </li>
      </ul>
    </li>

    <!-- Settings Variant -->
    <div v-else-if="variant === 'settings'">
      <select
          class="form-select"
          v-model="selectedLanguage"
          @change="changeLanguage(selectedLanguage)"
      >
        <option
            v-for="lang in languages"
            :key="lang.code"
            :value="lang.code"
        >
          {{ lang.flag }} {{ lang.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";

export default {
  name: "LanguageSwitcher",
  props: {
    variant: {
      type: String,
      default: "navbar", // Default to the navbar variant
    },
  },
  setup() {
    const {locale} = useI18n();
    const selectedLanguage = ref(locale.value);

    // List of available languages
    const languages = [
      {code: "en", label: "English", flag: "🇺🇸"},
      {code: "uk", label: "Українська", flag: "🇺🇦"},
      {code: "pl", label: "Polski", flag: "🇵🇱"},
    ];

    // Method to change the language
    const changeLanguage = (lang) => {
      locale.value = lang; // Update the current language
      selectedLanguage.value = lang; // Synchronize selectedLanguage
      localStorage.setItem("selectedLanguage", lang); // Save the preference
      window.location.reload();
    };

    // Compute the current language with its flag
    const currentLanguageWithFlag = computed(() => {
      const lang = languages.find((lang) => lang.code === locale.value);
      return lang ? `${lang.flag} ${lang.label}` : "🌐 Select";
    });

    return {
      locale,
      languages,
      changeLanguage,
      currentLanguageWithFlag,
      selectedLanguage,
    };
  },
};
</script>

<style scoped>
.dropdown-item {
  cursor: pointer;
}

.dropdown-item span {
  font-size: 1.25rem; /* Increase flag size */
}

.form-select {
  max-width: 300px; /* Adjust width for the settings variant */
}
</style>