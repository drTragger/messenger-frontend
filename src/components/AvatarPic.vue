<template>
  <div v-if="!!this.user" class="relative">
    <Avatar :label="getLabel" class="mr-2" :size="size" :style="{ backgroundColor: getRandomBackground }"
            shape="circle" :image="getProfilePicture"/>
    <!-- Online Indicator -->
    <span
        v-if="isOnline && !hasError"
        class="absolute bottom-1 right-3 w-3 h-3 bg-green-500 border border-white rounded-full shadow-sm"
    ></span>
  </div>

  <div v-else
       :class="{
        'flex items-center justify-center relative w-14 h-14 rounded-full mr-4 border-2 border-gray-300': !profilePicture || hasError,
        'flex items-center justify-center relative w-14 h-14 rounded-full mr-4': profilePicture && !hasError,
      }"
  >
    <!-- Default Avatar (Placeholder) -->
    <i v-if="!profilePicture || hasError" class="pi pi-user text-gray-400 text-4xl"></i>

    <!-- Profile Picture -->
    <Image
        v-else
        :src="getProfilePicture"
        :alt="$t('notAvailable')"
        :pt="{previewMask: {class: 'rounded-full'}}"
        image-class="rounded-full w-full h-full object-cover"
        :preview="preview"
        @error="handleImageError"
    />

    <!-- Online Indicator -->
    <span
        v-if="isOnline && !hasError"
        class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-white rounded-full shadow-sm"
    ></span>
  </div>
</template>

<script>
import {isEmoji} from "@/utils/i18n";

export default {
  props: {
    user: Object,
    size: {
      type: String,
      required: false,
      default: "xlarge", // Default size if not provided
      validator(value) {
        // Define the allowed sizes
        const validSizes = ["small", "large", "xlarge"];
        return validSizes.includes(value);
      },
    },
    profilePicture: String,
    isOnline: Boolean,
    preview: Boolean,
  },
  data() {
    return {
      hasError: false,
    };
  },
  computed: {
    getProfilePicture() {
      if (!this.profilePicture) return null;
      try {
        const apiUrl = process.env.VUE_APP_API_URL.replace(/\/+$/, '');
        return `${apiUrl}/users/profile-picture/${this.profilePicture}`;
      } catch (e) {
        console.error('Error constructing profile picture URL:', e);
        return null;
      }
    },
    getLabel() {
      if (this.profilePicture) return;

      let label = "";

      if (this.user.firstName) {
        const firstChar = this.user.firstName.codePointAt(0);
        label = isEmoji(firstChar)
            ? this.user.firstName[0] // Handle emoji as the first character
            : this.user.firstName.charAt(0).toUpperCase();

        if (this.user?.lastName) {
          const lastChar = this.user.lastName.codePointAt(0);
          if (!isEmoji(lastChar)) {
            label += this.user.lastName.charAt(0).toUpperCase();
          }
        }
        return label;
      }

      const usernameChar = this.user.username.codePointAt(0);
      return isEmoji(usernameChar)
          ? this.user.username[0]
          : this.user.username.charAt(0).toUpperCase();
    },
    getRandomBackground() {
      const label = this.getLabel;
      if (!label) return 'bg-gray-200'; // Default background if no label

      // Hash the label to generate a consistent index
      const colors = [
        '#FFB3BA', // Light Red
        '#FFDFBA', // Peach
        '#FFFFBA', // Light Yellow
        '#BAFFC9', // Light Green
        '#BAE1FF', // Light Blue
        '#D9BAFF', // Lavender
        '#FFC4E1', // Soft Pink
        '#C4E7FF', // Soft Sky Blue
        '#E2F0CB', // Mint Green
        '#FDE2E4', // Blush Pink
        '#E0BBE4', // Light Purple
        '#FFCCF9', // Soft Violet
        '#D5AAFF', // Lilac
        '#B5EAD7', // Aqua
        '#A2D2FF', // Baby Blue
      ];
      const hash = Array.from(label).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    },
  },
  methods: {
    handleImageError() {
      console.warn('Failed to load profile picture. Showing placeholder.');
      this.hasError = true;
    },
  },
};
</script>
