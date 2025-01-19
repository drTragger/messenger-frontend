<template>
  <div class="container mx-auto my-10" v-if="isAuthenticated">
    <!-- Header -->
    <PageHeader :title="appName" :subtitle="$t('home.subtitle')"/>

    <!-- Search Field -->
    <UserSearch @user-selected="createChat" />

    <!-- Chats List -->
    <div v-if="chats.length" class="space-y-4">
      <div
          class="flex items-center p-4 bg-white shadow rounded-lg hover:shadow-md transition cursor-pointer"
          v-for="chat in chats"
          :key="chat.id"
          @click="openChat(chat)"
      >
        <!-- User Avatar -->
        <AvatarPic
            :profilePicture="getChatPartner(chat)?.profilePicture"
            :isOnline="getChatPartner(chat)?.isOnline"
        />

        <!-- Chat Details -->
        <div class="flex-grow ml-4 overflow-hidden">
          <h5 class="text-gray-800 font-semibold text-lg truncate">
            {{ getChatPartner(chat).username }}
          </h5>
          <p class="text-gray-500 text-md truncate">
            {{ chat?.lastMessage?.content || $t('chat.lastMessage.empty') }}
          </p>
        </div>

        <!-- Time -->
        <small class="text-gray-400 text-sm">
          {{ formatLastSeen(chat?.lastMessage?.createdAt) }}
          <i v-if="chat?.lastMessage && chat.lastMessage.recipientId === getChatPartner(chat).id" class="pi pi-check ml-1.5 text-xs" :class="{'pi-check-circle': chat.lastMessage.readAt}"></i>
        </small>
      </div>
    </div>

    <!-- No Chats -->
    <NoMessages v-else class="hidden mt-20" ref="noMessages" :title="$t('chat.empty.title')" :subtitle="$t('chat.empty.subtitle')"/>
  </div>
</template>

<script>
import apiClient from "@/utils/api";
import {authStore} from "@/utils/auth";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import {homePageWsHandler} from "@/utils/websocket/wsHandlers";
import {formatLastSeen} from "@/utils/formatTime";
import AvatarPic from "@/components/AvatarPic.vue";
import UserSearch from "@/components/UserSearch.vue";
import PageHeader from "@/components/PageHeader.vue";
import NoMessages from "@/components/NoMessages.vue";

export default {
  components: {NoMessages, PageHeader, UserSearch, AvatarPic},
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
        if (error.status === 404) {
          if (this.chats.length < 1) {
            this.$refs.noMessages.$el.classList.remove("hidden");
          }
        }
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
