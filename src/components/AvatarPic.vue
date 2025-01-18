<template>
  <div
      :class="{
      'flex items-center justify-center relative w-12 h-12 rounded-full mr-4 border-2 border-gray-300': !profilePicture,
      'flex items-center justify-center relative w-12 h-12 rounded-full mr-4': profilePicture,
    }"
  >
    <!-- Default Avatar -->
    <i v-if="!profilePicture" class="pi pi-user text-gray-400 text-4xl"></i>

    <!-- Profile Picture -->
    <Image
        v-else
        :src="getProfilePicture"
        alt="Profile"
        image-class="rounded-full w-full h-full object-cover"
    />

    <!-- Online Indicator -->
    <span
        v-if="isOnline"
        class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-white rounded-full shadow-sm"
    ></span>
  </div>
</template>

<script>
export default {
  props: {
    profilePicture: String,
    isOnline: Boolean,
  },
  computed: {
    getProfilePicture() {
      const apiUrl = process.env.VUE_APP_API_URL.replace(/\/+$/, '');
      return `${apiUrl}/users/profile-picture/${this.profilePicture}`;
    },
  },
};
</script>
