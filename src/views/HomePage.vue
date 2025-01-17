<template>
  <div class="container my-5" v-if="isAuthenticated">
    <!-- Header -->
    <div class="text-center mb-5">
      <h1 class="text-primary">{{ appName }}</h1>
      <p class="text-muted">{{ $t('home.subtitle') }}</p>
    </div>

    <!-- Search Field -->
    <UserSearch @user-selected="createChat"/>

    <!-- Chats List -->
    <div v-if="chats.length" class="list-group">
      <div
          class="list-group-item list-group-item-action d-flex align-items-center p-3 shadow-sm"
          v-for="chat in chats"
          :key="chat.id"
          @click="openChat(chat)"
          style="cursor: pointer"
      >
        <!-- User Avatar -->
        <AvatarPic :profilePicture="getChatPartner(chat)?.profilePicture" :isOnline="getChatPartner(chat)?.isOnline"/>

        <!-- Chat Details -->
        <div class="flex-grow-1">
          <h5 class="mb-1 text-truncate">{{ getChatPartner(chat).username }}</h5>
          <p class="mb-0 text-muted text-truncate">
            {{ chat?.lastMessage?.content || $t('messages.empty') }}
          </p>
        </div>

        <!-- Time -->
        <small class="text-muted">
          {{ formatLastSeen(chat?.lastMessage.createdAt) }}
        </small>
      </div>
    </div>

    <!-- No Chats -->
    <div v-else class="alert alert-info text-center" role="alert">
      <i class="bi bi-chat-dots-fill fs-4"></i>
      <p class="mt-2 mb-0 fs-5">{{ $t('messages.empty') }}</p>
    </div>
  </div>
</template>

<script>
import apiClient from "@/api";
import {authStore} from "@/utils/auth";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import {homePageWsHandler} from "@/utils/websocket/wsHandlers";
import {formatLastSeen} from "@/utils/formatTime";
import AvatarPic from "@/components/AvatarPic.vue";
import UserSearch from "@/components/UserSearch.vue";

export default {
  components: {UserSearch, AvatarPic},
  setup() {
    return {authStore};
  },
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      chats: [],
      searchQuery: "",
      searchResults: [], // Initialize as an empty array
      wsManager: null,
    };
  },
  async created() {
    this.checkAuth();

    this.wsManager = await getWebSocketManager(process.env.VUE_APP_WS_URL, localStorage.getItem("token"));
    this.wsManager.connect();
    this.wsManager.addMessageHandler(this.handleWebSocketMessage);

    await this.fetchChats();
  },
  beforeUnmount() {
    if (this.wsManager) {
      this.wsManager.removeMessageHandler(this.handleWebSocketMessage);
    }
  },
  computed: {
    isAuthenticated() {
      return !!authStore.isAuthenticated;
    },
  },
  methods: {
    formatLastSeen,
    handleWebSocketMessage(data) {
      homePageWsHandler(this, data);
    },
    checkAuth() {
      if (!authStore.isAuthenticated) {
        this.$router.push({name: "LoginPage"});
      }
    },
    async fetchChats() {
      try {
        const response = await apiClient.get("/chats", {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        this.chats = response.data.data;
      } catch (error) {
        console.error("Error fetching chats:", error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      }
    },
    getChatPartner(chat) {
      if (!authStore.user) return null;
      return chat.user1.id === authStore.user.id ? chat.user2 : chat.user1;
    },
    openChat(chat) {
      this.$router.push({name: "ChatPage", params: {chatId: chat.id}});
    },
    async createChat(user) {
      try {
        // Check if a chat with this user already exists
        const existingChat = this.chats.find(chat => {
          const chatPartner = this.getChatPartner(chat);
          return chatPartner && chatPartner.id === user.id;
        });

        if (existingChat) {
          // If chat exists, navigate to it
          this.openChat(existingChat);
        } else {
          // If no chat exists, create a new one
          const response = await apiClient.post(
              "/chats",
              {userId: user.id},
              {
                headers: {
                  Authorization: `Bearer ${authStore.token}`,
                },
              }
          );

          const newChat = response.data.data;
          this.chats.unshift(newChat); // Add the new chat to the top of the list
          this.searchQuery = ""; // Clear the search query
          this.searchResults = []; // Clear the search results

          // Navigate to the new chat
          this.openChat(newChat);
        }
      } catch (error) {
        console.error("Error creating or navigating to chat:", error.response?.data?.message || error.message);
      }
    },
  },
};
</script>
