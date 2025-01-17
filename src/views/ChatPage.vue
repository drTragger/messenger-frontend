<template>
  <div class="chat-page d-flex flex-column">
    <!-- Chat Header -->
    <ChatHeader
        :username="chatPartner?.username"
        :profilePicture="chatPartner?.profilePicture"
        :isOnline="chatPartner?.isOnline"
        :lastSeen="chatPartner?.lastSeen"
    />

    <!-- Messages Section -->
    <div ref="messagesContainer" class="chat-messages flex-grow-1 py-3 px-5 overflow-auto position-relative">
      <!-- Loading Indicator -->
      <div
          v-if="loading"
          class="loading-indicator text-center bg-light d-flex justify-content-center align-items-center fade position-absolute top-0 start-0 w-100"
      >
        <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
        {{ $t('chat.message.loading') }}
      </div>

      <!-- Messages Grouped by Date -->
      <template v-for="(group, date) in groupedMessages" :key="date">
        <!-- Date Header -->
        <div class="date-header text-center my-3">
          <small class="text-muted">
            {{
              formatTime(date, isCurrentYear(date) ? {month: "long", day: "numeric"} : {
                year: "numeric",
                month: "long",
                day: "numeric"
              })
            }}
          </small>
        </div>

        <!-- Messages -->
        <div v-for="message in group" :key="message.id" class="mb-2">
          <MessageBubble
              :message="message"
              :isMine="message.senderId === currentUserId"
              :isEnglishLocale="isEnglishLocale"
              @context-menu="openContextMenu($event, message)"
          />
        </div>
      </template>
    </div>

    <!-- Context Menu -->
    <ContextMenu
        ref="contextMenu"
        :model="contextMenuItems"
        :popup="true"
    >
      <template #item="{ item, props }">
        <a class="d-flex align-items-center py-1" v-bind="props.action" :style="{color: item.color ?? null}">
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

export default {
  components: {ChatHeader, MessageInput, MessageBubble, ContextMenu, Badge},
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
        const response = await apiClient.get("/messages", {
          params: {chatId: this.chatId, limit, offset: this.messages.length},
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
        if (error.status === 404) return;
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
          const response = await apiClient.patch(`/messages/${this.editingMessage.id}`,
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

        await apiClient.post("/messages", messagePayload, {
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
        await apiClient.delete(`/messages/${message.id}`, {
          headers: {Authorization: `Bearer ${authStore.token}`},
        });
        this.animateMessageDelete(message.id);
      } catch (error) {
        console.error("Error deleting message:", error.response?.data?.message || error.message);
      }
    },
    copyToClipboard(text) {
      console.log(text);
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
  },
};
</script>

<style scoped>
.chat-page {
  max-height: calc(100vh - var(--header-height));
}

.chat-messages {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-bottom: 20px;
  position: relative; /* Required for the absolute loading indicator */
}

.loading-indicator {
  z-index: 10; /* Ensure it appears above messages */
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.loading-indicator.fade {
  opacity: 1;
  transform: translateY(0);
}
</style>