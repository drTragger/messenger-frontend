<template>
  <div class="relative mb-4">
    <!-- Search Input -->
    <InputText
        v-model="searchQuery"
        :placeholder="$t('chat.searchUsers')"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-md focus:ring-blue-500 focus:border-blue-500"
        @input="searchUsers"
    />

    <!-- Dropdown List -->
    <Transition name="fade">
      <ul
          v-if="searchResults.length"
          class="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
      >
        <li
            v-for="user in searchResults"
            :key="user.id"
            class="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition"
            @click="selectUser(user)"
        >
          <AvatarPic :profilePicture="user?.profilePicture" :isOnline="user?.isOnline" />
          <div class="ml-3 flex-grow">
            <p class="text-gray-800 font-semibold truncate">{{ user.username }}</p>
            <p class="text-gray-500 text-sm truncate">{{ user.phone }}</p>
          </div>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script>
import apiClient from "@/utils/api";
import AvatarPic from "@/components/AvatarPic.vue";
import { debounce } from "lodash"; // Add debounce for better performance

export default {
  components: { AvatarPic },
  data() {
    return {
      searchQuery: "",
      searchResults: [],
    };
  },
  methods: {
    searchUsers: debounce(async function () {
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
    }, 300), // Debounce the API call with a 300ms delay

    selectUser(user) {
      this.$emit("user-selected", user);
      this.searchQuery = "";
      this.searchResults = [];
    },
  },
};
</script>

<style scoped>
/* Removed scoped CSS and replaced with Tailwind classes */
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