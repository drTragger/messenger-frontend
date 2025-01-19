<template>
  <div class="chat-page flex flex-col">
    <!-- Chat Header -->
    <ChatHeader
        :username="chatPartner?.username"
        :profilePicture="chatPartner?.profilePicture"
        :isOnline="chatPartner?.isOnline"
        :lastSeen="chatPartner?.lastSeen"
    />

    <!-- Messages Section -->
    <div ref="messagesContainer" class="flex-grow overflow-auto py-3 px-5 relative bg-white flex flex-col">
      <!-- Loading Indicator -->
      <div
          v-if="loading"
          class="absolute inset-x-0 top-0 flex items-center justify-center bg-white bg-opacity-75 py-3"
      >
        <div class="animate-spin h-5 w-5 border-4 border-gray-600 border-t-transparent rounded-full"></div>
        <span class="ml-2 text-gray-600">{{ $t('chat.message.loading') }}</span>
      </div>

      <!-- Messages Grouped by Date -->
      <div v-if="!loading && this.messages.length">
        <template v-for="(group, date) in groupedMessages" :key="date">
          <!-- Date Header -->
          <div class="text-center my-4 text-sm text-gray-500">
            {{
              formatTime(date, isCurrentYear(date) ? {month: "long", day: "numeric"} : {
                year: "numeric",
                month: "long",
                day: "numeric"
              })
            }}
          </div>

          <!-- Messages -->
          <div v-for="message in group" :key="message.id" class="mb-2">
            <MessageBubble
                :message="message"
                :isMine="message.senderId === currentUserId"
                :isEnglishLocale="isEnglishLocale"
                @context-menu="openContextMenu($event, message)"
                @mark-as-read="markMessageAsRead"
            />
          </div>
        </template>
      </div>

      <!-- No Messages Container -->
      <NoMessages v-else class="hidden" ref="noMessages" :title="$t('messages.empty.title')" :subtitle="$t('messages.empty.subtitle')"/>
    </div>

    <!-- Context Menu -->
    <ContextMenu ref="contextMenu" :model="contextMenuItems" :popup="true">
      <template #item="{ item, props }">
        <a class="flex items-center px-4 py-2 hover:bg-gray-100 rounded transition duration-200 ease-in-out"
           v-bind="props.action" :style="{color: item.color ?? null}">
          <span :class="item.icon"/>
          <span class="ml-2">{{ item.label }}</span>
          <Badge v-if="item.badge" class="mx-auto" :value="item.badge"/>
          <i v-if="item.items" class="pi pi-angle-right ml-auto"></i>
        </a>
      </template>
    </ContextMenu>

    <!-- Input Section -->
    <MessageInput
        @send-message="sendMessage"
        :editing-message="editingMessage"
        @cancel-edit="cancelEdit"
    />
  </div>
</template>

<script>
import apiClient from "@/utils/api";
import {authStore} from "@/utils/auth";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import {chatPageWsHandler} from "@/utils/websocket/wsHandlers";
import {formatTime, isCurrentYear} from "@/utils/formatTime";
import _ from "lodash";
import MessageBubble from "@/components/MessageBubble.vue";
import MessageInput from "@/components/MessageInput.vue";
import ChatHeader from "@/components/ChatHeader.vue";
import ContextMenu from "primevue/contextmenu";
import Badge from "primevue/badge";
import NoMessages from "@/components/NoMessages.vue";

export default {
  components: {NoMessages, ChatHeader, MessageInput, MessageBubble, ContextMenu, Badge},
  setup() {
    return {authStore};
  },
  data() {
    return {
      chatId: null,
      messages: [],
      newMessage: "",
      chatPartner: null,
      currentUserId: null,
      wsManager: null,
      limit: 20,
      allMessagesLoaded: false,
      loading: false,
      editingMessage: null,
      contextMenuItems: [],
    };
  },
  mounted() {
    const container = this.$refs.messagesContainer;
    if (container) {
      container.addEventListener("scroll", this.handleScroll);
    }
  },
  async created() {
    this.chatId = parseInt(this.$route.params.chatId);

    if (!authStore.user) {
      await authStore.fetchUser();
    }
    this.currentUserId = authStore.user.id;

    this.wsManager = getWebSocketManager(process.env.VUE_APP_WS_URL, authStore.token);
    this.wsManager.connect();
    this.wsManager.addMessageHandler(this.handleWebSocketMessage);

    await this.fetchChatDetails();
    await this.fetchMessages();

    await this.$nextTick();
    this.scrollToBottom();
  },
  beforeUnmount() {
    if (this.wsManager) {
      this.wsManager.removeMessageHandler(this.handleWebSocketMessage);
    }
    const container = this.$refs.messagesContainer;
    if (container) {
      container.removeEventListener("scroll", this.handleScroll);
    }
  },
  computed: {
    isEnglishLocale() {
      return localStorage.getItem('selectedLanguage') === 'en';
    },
    groupedMessages() {
      return this.messages.reduce((groups, message) => {
        const date = new Date(message.createdAt).toDateString(); // Generate a valid date string
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
      }, {});
    },
  },
  methods: {
    formatTime,
    isCurrentYear,
    handleWebSocketMessage(message) {
      chatPageWsHandler(this, message);
    },
    async fetchChatDetails() {
      try {
        const response = await apiClient.get(`/chats/${this.chatId}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        const chat = response.data.data;
        this.chatPartner = chat.user1.id === this.currentUserId ? chat.user2 : chat.user1;

        // Fetch online status and last seen for the chat partner
        const statusResponse = await apiClient.get(`/users/online/${this.chatPartner.id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (!statusResponse.data?.data) return

        this.chatPartner.isOnline = statusResponse.data.data.isOnline;
      } catch (error) {
        console.error("Error fetching chat details or online status:", error.message);
      }
    },
    async fetchMessages(limit = this.limit) {
      if (this.loading || this.allMessagesLoaded) return;

      this.loading = true;
      const container = this.$refs.messagesContainer;
      const previousScrollHeight = container.scrollHeight;

      try {
        const response = await apiClient.get(`/chats/${this.chatId}/messages`, {
          params: {limit, offset: this.messages.length},
          headers: {Authorization: `Bearer ${authStore.token}`},
        });

        const newMessages = response.data.data;

        if (newMessages.length < limit) {
          this.allMessagesLoaded = true;
        }

        this.messages = [...newMessages.reverse(), ...this.messages];

        await this.$nextTick();
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeight;
      } catch (error) {
        if (error.status === 404) {
          if (this.messages.length < 1) {
            this.$refs.noMessages.$el.classList.remove("hidden");
          }
          return;
        }
        console.error("Error fetching messages:", error.message);
      } finally {
        this.loading = false;
      }
    },
    handleScroll: _.debounce(function () {
      const container = this.$refs.messagesContainer;

      // If near the top and messages are not fully loaded
      if (container.scrollTop <= 100 && !this.allMessagesLoaded) {
        this.fetchMessages();
      }
    }, 100),
    prepareForEdit(message) {
      this.editingMessage = message;
    },
    cancelEdit() {
      this.editingMessage = null; // Clear editing state
    },
    async sendMessage(message) {
      if (!message.trim()) return;

      if (this.editingMessage) {
        try {
          const response = await apiClient.patch(`/chats/${this.chatId}/messages/${this.editingMessage.id}`,
              {content: message},
              {headers: {Authorization: `Bearer ${authStore.token}`}},
          );
          this.editingMessage.content = response.data.data.content;
          this.editingMessage.updatedAt = response.data.data.updatedAt;
          this.editingMessage = null;
        } catch (error) {
          this.cancelEdit();
          console.error("Error updating message:", error.message);
        }
        return
      }

      try {
        const messagePayload = {
          chatId: this.chatId,
          message: message.trim(),
          recipientId: this.chatPartner.id,
        };

        await apiClient.post(`/chats/${this.chatId}/messages`, messagePayload, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }).then(response => {
          const sentMessage = response.data.data;
          this.messages.push(sentMessage);
        }).catch(error => {
          console.error("Error sending message:", error.response?.data?.message || error.message);
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
      await this.$nextTick();
      this.scrollToBottom();
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    openContextMenu(event, message) {
      if (message.senderId === this.currentUserId) {
        this.contextMenuItems = [
          {
            label: this.$t("chat.contextMenu.reply"),
            icon: "pi pi-reply",
            command: () => this.replyToMessage(message),
          },
          {
            separator: true,
          },
          {
            label: this.$t("chat.contextMenu.copy"),
            icon: "pi pi-copy",
            command: () => this.copyToClipboard(message.content),
          },
          {
            separator: true,
          },
          {
            label: this.$t("chat.contextMenu.edit"),
            icon: "pi pi-pencil",
            command: () => this.prepareForEdit(message),
          },
          {
            separator: true,
          },
          {
            label: this.$t("chat.contextMenu.delete"),
            icon: "pi pi-trash",
            color: "#ff595a",
            command: () => this.deleteMessage(message),
          },
        ];
      } else {
        this.contextMenuItems = [
          {
            label: this.$t("chat.contextMenu.reply"),
            icon: "pi pi-reply",
            command: () => this.replyToMessage(message),
          },
          {
            separator: true,
          },
          {
            label: this.$t("chat.contextMenu.copy"),
            icon: "pi pi-copy",
            command: () => this.copyToClipboard(message.content),
          },
        ];
      }

      this.$refs.contextMenu.show(event);
    },
    async deleteMessage(message) {
      try {
        await apiClient.delete(`/chats/${this.chatId}/messages/${message.id}`, {
          headers: {Authorization: `Bearer ${authStore.token}`},
        });
        this.animateMessageDelete(message.id);
      } catch (error) {
        console.error("Error deleting message:", error.response?.data?.message || error.message);
      }
    },
    copyToClipboard(text) {
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // Prevent scrolling to the bottom
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          console.log("Fallback: Text copied to clipboard");
        } catch (err) {
          console.error("Fallback: Unable to copy text", err);
        }
        document.body.removeChild(textArea);
        return;
      }

      // Modern method using Clipboard API
      navigator.clipboard.writeText(text)
          .then(() => {
            console.log("Text copied to clipboard");
          })
          .catch(err => {
            console.error("Failed to copy text to clipboard", err);
          });
    },
    animateMessageDelete(messageId) {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.classList.add("fade-out");
        setTimeout(() => {
          this.messages = this.messages.filter((msg) => msg.id !== messageId);
        }, 300);
      }
    },
    replyToMessage(message) {
      console.log("Replying to message:", message);
    },
    async markMessageAsRead(messageId) {
      try {
        await apiClient.patch(`/chats/${this.chatId}/messages/${messageId}/read`, null, {
          headers: {Authorization: `Bearer ${authStore.token}`},
        });

        // Update the message locally
        const message = this.messages.find((msg) => msg.id === messageId);
        if (message) {
          message.readAt = new Date().toISOString();
        }
      } catch (error) {
        console.error("Error marking message as read:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.chat-page {
  max-height: calc(100vh - var(--header-height)) !important;
  min-height: calc(100vh - var(--header-height)) !important;
}
</style>