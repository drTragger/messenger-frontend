<template>
  <div :id="`message-${message.id}`" class="flex" :class="containerClasses" ref="messageRef">
    <div class="message-bubble rounded-2xl py-2 px-4 max-w-[45vw]" :class="bubbleClasses"
         @contextmenu.prevent="emitContextMenuEvent">
      <div
          class="message-content"
          v-html="formattedMessageContent"
      ></div>
      <div class="flex justify-end align-baseline">
        <small :class="timeClasses">
          <span v-if="isEdited" class="mr-1">{{ $t('chat.message.edited') }}</span>
          <span>{{ isEdited ? formatTime(message.updatedAt) : formatTime(message.createdAt) }}</span>
          <i v-if="isMine" class="pi pi-check ml-1.5 text-xs" :class="readAtIconClasses"></i>
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import {formatTime} from "@/utils/formatTime";

export default {
  props: {
    message: {type: Object, required: true},
    isMine: {type: Boolean, default: false},
    isEnglishLocale: {type: Boolean, default: false},
  },
  emits: ["context-menu", "mark-as-read"],
  computed: {
    containerClasses() {
      return {
          "justify-end": this.isMine,
          "justify-start": !this.isMine,
    }
    },
    bubbleClasses() {
      return {
        "bg-blue-500 text-white": this.isMine,
        "bg-gray-200 text-black": !this.isMine,
      };
    },
    timeClasses() {
      return {
        "bg-blue-500 text-white": this.isMine,
        "bg-gray-200 text-black": !this.isMine,
      }
    },
    isEdited() {
      return this.message.updatedAt !== this.message.createdAt;
    },
    formattedMessageContent() {
      return this.message.content ? this.message.content.replace(/\n/g, "<br>") : "";
    },
    readAtIconClasses() {
      return this.message.readAt ? "pi-check-circle" : "";
    },
  },
  mounted() {
    this.observeMessage();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    formatTime,
    emitContextMenuEvent(event) {
      this.$emit("context-menu", event, this.message);
    },
    cleanup() {
      this.observer?.disconnect();
      document.removeEventListener("visibilitychange", this.recheckVisibility);
      window.removeEventListener("focus", this.recheckVisibility);
    },
    observeMessage() {
      if (this.observer || !this.$refs.messageRef) return;

      // Initialize the IntersectionObserver
      this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                  document.hasFocus() && // Ensure the document is focused
                  entry.isIntersecting && // The element is in the viewport
                  !this.message.readAt && // The message has not been marked as read
                  !this.isMine // The message is not sent by the current user
              ) {
                this.$emit("mark-as-read", this.message.id);
              }
            });
          },
          {
            root: document.querySelector(".messages-container"), // Limit the observation to the message container
            threshold: 0.5, // Trigger when at least 50% of the message is visible
          }
      );

      // Observe the message element
      this.observer.observe(this.$refs.messageRef);

      // Bind visibility recheck
      this.recheckVisibility = () => {
        if (!document.hidden && this.$refs.messageRef) {
          const rect = this.$refs.messageRef.getBoundingClientRect();
          const isInViewport =
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <= (window.innerWidth || document.documentElement.clientWidth);

          if (isInViewport && !this.message.readAt && !this.isMine) {
            this.$emit("mark-as-read", this.message.id);
          }
        }
      };

      // Add event listeners for visibility and focus changes
      document.addEventListener("visibilitychange", this.recheckVisibility);
      window.addEventListener("focus", this.recheckVisibility);
    },
  },
};
</script>

<style scoped>
/* Fade-out animation for deleted messages */
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.fade-out {
  animation: fadeOut 0.3s forwards;
}
</style>