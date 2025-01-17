<template>
  <div :id="`message-${message.id}`" :class="containerClasses">
      <div :class="bubbleClasses" @contextmenu.prevent="emitContextMenuEvent">
        <div class="message-content">
          {{ message.content }}
        </div>
        <small class="message-time">
          <span v-if="isEdited" class="me-1">{{ $t('chat.message.edited') }}</span>
          <span>{{ isEdited ? formatTime(message.updatedAt) : formatTime(message.createdAt) }}</span>
        </small>
      </div>
    </div>
</template>

<script>
import {formatTime} from "@/utils/formatTime";

export default {
  props: {
    message: {type: JSON, required: true},
    isMine: {type: Boolean, default: false},
    isEnglishLocale: {type: Boolean, default: false},
  },
  emits: ["context-menu"],
  data() {
    return {
      timeWidth: 33,
      isMultiline : false,
    };
  },
  computed: {
    containerClasses() {
      return {
        "d-flex justify-content-end": this.isMine,
        "d-flex justify-content-start": !this.isMine,
      };
    },
    bubbleClasses() {
      return {
        "message-bubble my-message": this.isMine,
        "message-bubble partner-message": !this.isMine,
      };
    },
    isEdited() {
      return this.message.updatedAt !== this.message.createdAt;
    },
  },
  methods: {
    formatTime,
    emitContextMenuEvent(event) {
      this.$emit("context-menu", event, this.message);
    },
  },
};
</script>

<style scoped>
.message-bubble {
  max-width: 45%;
  white-space: pre-wrap;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 1rem;
  text-align: left;
  overflow: hidden;

  display: flex;
  flex-direction: column;
}

.my-message {
  background-color: var(--bs-primary);
  color: white;
}

.partner-message {
  background-color: var(--bs-gray-300);
  color: black;
}

.message-time {
  font-size: 0.7rem;
  align-self: end;
}

.partner-message .message-time {
  color: rgba(0, 0, 0, 0.5);
}

.my-message .message-time {
  color: rgba(255, 255, 255, 0.7);
}

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
  animation: fadeOut 0.3s forwards; /* 300ms matches setTimeout duration */
}
</style>