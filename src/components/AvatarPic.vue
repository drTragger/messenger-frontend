<template>
  <div class="avatar-wrapper position-relative me-3">
    <i v-if="!profilePicture" class="bi bi-person-circle fs-1 text-secondary"></i>
    <img
        v-else
        :src="getProfilePicture"
        alt="Profile"
        class="avatar rounded-circle"
    />
    <span v-if="isOnline" class="status-indicator"></span>
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
      const apiUrl = process.env.VUE_APP_API_URL.replace(/\/+$/, '')
      return `${apiUrl}/users/profile-picture?file=${this.profilePicture}`
    }
  },
};
</script>

<style scoped>
.avatar-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 50px;
  height: 50px;
}

img.avatar {
  border-radius: 50%;
  width: inherit;
  height: inherit;
}

.status-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  background-color: #28a745;
  border: 1px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}
</style>