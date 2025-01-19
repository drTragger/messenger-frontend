<template>
  <div
      :class="{
        'flex items-center justify-center relative w-12 h-12 rounded-full mr-4 border-2 border-gray-300': !profilePicture || hasError,
        'flex items-center justify-center relative w-12 h-12 rounded-full mr-4': profilePicture && !hasError,
      }"
  >
    <!-- Default Avatar (Placeholder) -->
    <i v-if="!profilePicture || hasError" class="pi pi-user text-gray-400 text-4xl"></i>

    <!-- Profile Picture -->
    <Image
        v-else
        :src="getProfilePicture"
        :alt="$t('notAvailable')"
         class="rounded-image"
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
export default {
  props: {
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
  },
  methods: {
    handleImageError() {
      console.warn('Failed to load profile picture. Showing placeholder.');
      this.hasError = true;
    },
  },
};
</script>
