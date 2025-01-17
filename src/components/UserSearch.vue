<template>
  <div class="mb-4 position-relative">
    <!-- Search Input -->
    <input
        type="text"
        class="form-control"
        v-model="searchQuery"
        :placeholder="$t('chat.searchUsers')"
        @input="searchUsers"
    />

    <!-- Dropdown List -->
    <transition name="fade">
      <ul
          v-if="searchResults.length"
          class="dropdown-list rounded shadow-lg position-absolute w-100 mt-1"
      >
        <li
            v-for="user in searchResults"
            :key="user.id"
            class="dropdown-item d-flex align-items-center py-2 px-3"
            @click="selectUser(user)"
        >
          <AvatarPic :profilePicture="user?.profilePicture" :isOnline="user?.isOnline" />
          <div class="user-info ms-2">
            <strong>{{ user.username }}</strong>
            <small class="text-muted d-block">{{ user.phone }}</small>
          </div>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
import apiClient from "@/utils/api";
import AvatarPic from "@/components/AvatarPic.vue";

export default {
  components: { AvatarPic },
  data() {
    return {
      searchQuery: "",
      searchResults: [],
    };
  },
  methods: {
    async searchUsers() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }

      if (this.searchQuery.length < 3) {
        return;
      }

      try {
        const response = await apiClient.get("/users", {
          params: { query: this.searchQuery },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        this.searchResults = response.data.data;
      } catch (error) {
        console.error("Error searching users:", error.response?.data?.message || error.message);
        this.searchResults = [];
      }
    },
    selectUser(user) {
      this.$emit("user-selected", user);
      this.searchQuery = "";
      this.searchResults = [];
    },
  },
};
</script>

<style scoped>
.dropdown-list {
  list-style: none;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.375rem;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  position: absolute;
  top: calc(100% + 0.25rem);
  z-index: 1050;
  width: 100%;
}

.dropdown-item {
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
}

.user-info {
  flex-grow: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>