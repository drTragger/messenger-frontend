<template>
  <div class="chat-page flex flex-col">
    <!-- Chat Header -->
    <ChatHeader v-if="chatPartner" :user="chatPartner"/>

    <!-- Messages Section -->
    <div ref="messagesContainer" class="messages-container flex-grow overflow-auto py-3 px-5 relative bg-white flex flex-col">
      <!-- Loading Indicator -->
      <div
          v-if="loading"
          class="absolute inset-x-0 top-0 flex items-center justify-center bg-white bg-opacity-75 py-3 z-50"
      >
        <div class="flex items-center space-x-2">
          <ProgressSpinner
              style="width: 20px; height: 20px"
              strokeWidth="4"
              fill="transparent"
              animationDuration="1s"
              aria-label="Loading"
          />
          <span class="text-gray-600 text-sm">{{ $t('chat.message.loading') }}</span>
        </div>
      </div>

      <!-- Messages Grouped by Date -->
      <div v-if="this.messages.length">
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
      <NoMessages v-else class="hidden" ref="noMessages" :title="$t('messages.empty.title')"
                  :subtitle="$t('messages.empty.subtitle')"/>
      <ScrollBottom target=".messages-container" :threshold="300"/>
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

    <!-- Reply Preview Section -->
    <div v-if="replyingToMessage" class="reply-preview flex items-center px-4 py-2 bg-gray-100 border-t border-gray-200">
      <div class="flex-grow">
        <p class="text-sm text-gray-700 font-medium">{{ replyingToMessage.sender?.username }}</p>
        <p class="text-sm text-gray-500 truncate">{{ replyingToMessage.content }}</p>
      </div>
      <Button
          icon="pi pi-times"
          class="p-button-sm p-button-text text-gray-500 hover:text-gray-700"
          @click="cancelReply"
      />
    </div>

    <!-- Input Section -->
    <MessageInput
        @send-message="sendMessage"
        :editing-message="editingMessage"
        @cancel-edit="cancelEdit"
    />
  </div>
</template>

<script>
import {authStore} from "@/utils/auth";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import {chatPageWsHandler} from "@/utils/websocket/wsHandlers";
import {formatTime, isCurrentYear} from "@/utils/formatTime";
import {
  fetchChatDetails,
  fetchMessages,
  sendMessageApi,
  editMessageApi,
  deleteMessageApi,
  animateMessageDelete,
  markMessageAsReadApi
} from "@/services/chatService";
import {myMessageContextMenuItems, partnerMessageContextMenuItems} from "@/utils/contextMenu";
import {useToast} from "primevue";
import _ from "lodash";
import MessageBubble from "@/components/MessageBubble.vue";
import MessageInput from "@/components/MessageInput.vue";
import ChatHeader from "@/components/ChatHeader.vue";
import ContextMenu from "primevue/contextmenu";
import Badge from "primevue/badge";
import NoMessages from "@/components/NoMessages.vue";
import ScrollBottom from "@/components/ScrollBottom.vue";

export default {
  components: {ScrollBottom, NoMessages, ChatHeader, MessageInput, MessageBubble, ContextMenu, Badge},
  setup() {
    const toast = useToast();
    return {authStore, toast};
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
      replyingToMessage: null,
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

    this.chatPartner = await this.fetchChatDetails(this.chatId, authStore.user.id);
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
        const date = new Date(message.createdAt).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
      }, {});
    },
  },
  methods: {
    formatTime,
    isCurrentYear,
    fetchChatDetails,
    handleWebSocketMessage(message) {
      chatPageWsHandler(this, message);
    },
    replyToMessage(message) {
      this.replyingToMessage = message;
    },
    cancelReply() {
      this.replyingToMessage = null;
    },
    prepareForEdit(message) {
      this.editingMessage = message;
    },
    cancelEdit() {
      this.editingMessage = null;
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    handleScroll: _.debounce(function () {
      const container = this.$refs.messagesContainer;

      // If near the top and messages are not fully loaded
      if (container.scrollTop <= 100 && !this.allMessagesLoaded) {
        this.fetchMessages();
      }
    }, 100),
    async fetchMessages(limit = this.limit) {
      if (this.loading || this.allMessagesLoaded) return;

      this.loading = true;
      const container = this.$refs.messagesContainer;
      const previousScrollHeight = container.scrollHeight;

      try {
        const newMessages = await fetchMessages(this.chatId, this.messages.length, this.limit);

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
    async sendMessage(message) {
      if (!message.text.trim() && message.attachments.length < 1) return;

      if (this.editingMessage) {
        try {
          const response = await editMessageApi(this.chatId, this.editingMessage.id, {content: message.text});
          this.editingMessage.content = response.data.data.content;
          this.editingMessage.updatedAt = response.data.data.updatedAt;
          this.editingMessage = null;
        } catch (error) {
          this.toast.add({
            severity: 'error',
            summary: this.$t('toast.summary.error'),
            detail: this.$t('errors.message.edit'),
            life: 3000,
          });
          this.cancelEdit();
          console.error("Error updating message:", error.message);
        }
        return
      }

      try {
        const response = await sendMessageApi(
            this.chatId,
            {chatId: this.chatId, content: message.text, parentId: this?.replyingToMessage?.id, recipientId: this.chatPartner.id},
            message.attachments
        );
        this.messages.push(response.data.data);
        this.replyingToMessage = null;

        await this.$nextTick();
        this.scrollToBottom();
      } catch (error) {
        this.toast.add({
          severity: 'error',
          summary: this.$t('toast.summary.error'),
          detail: this.$t('errors.message.send'),
          life: 3000,
        });
        console.error("Error sending message:", error);
      }
    },
    async deleteMessage(message) {
      try {
        await deleteMessageApi(this.chatId, message.id);
        animateMessageDelete(message.id, this);
      } catch (error) {
        console.error("Error deleting message:", error.response?.data?.message || error.message);
      }
    },
    async markMessageAsRead(messageId) {
      try {
        await markMessageAsReadApi(this.chatId, messageId);
        const message = this.messages.find((msg) => msg.id === messageId);
        if (message) {
          message.readAt = new Date().toISOString();
        }
      } catch (error) {
        console.error("Error marking message as read:", error.message);
      }
    },
    openContextMenu(event, message) {
      this.contextMenuItems = message.senderId === this.currentUserId
          ? myMessageContextMenuItems(message, this)
          : partnerMessageContextMenuItems(message, this);

      this.$refs.contextMenu.show(event);
    },
  },
};
</script>

<style scoped>
.chat-page {
  height: calc(100vh - var(--header-height)) !important;
}
</style>