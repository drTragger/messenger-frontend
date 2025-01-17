<template>
  <div class="chat-input py-4 px-3 bg-white d-flex align-items-end bg-body-secondary">
    <!-- Emoji Picker Button -->
    <button
        class="btn btn-outline-secondary me-2"
        :class="{ 'active': this.showEmojiPicker }"
        @click="toggleEmojiPicker"
    >
      <i class="bi bi-emoji-smile"></i>
    </button>

    <!-- File Attachment Button -->
    <button class="btn btn-outline-secondary me-2" @click="attachFile">
      <i class="bi bi-paperclip"></i>
    </button>

    <!-- Text Input -->
    <textarea
        ref="messageTextarea"
        v-model="currentMessage"
        :placeholder="$t('chat.message.type')"
        class="form-control flex-grow-1"
        rows="1"
        @input="autoGrow($event.target)"
        @keydown.enter.exact.prevent="sendMessage"
    ></textarea>

    <!-- Send Button -->
    <button class="btn btn-primary ms-2" @click="sendMessage">
      <i v-if="!editingMessage" class="bi bi-send"></i>
      <i v-else class="bi bi-check"></i>
    </button>
    <button v-if="editingMessage" class="btn btn-secondary ms-2" @click="cancelEdit">
      <i class="bi bi-x"></i>
    </button>

    <!-- Emoji Picker -->
    <div v-if="showEmojiPicker" ref="emojiContainer" class="emoji-picker-container">
      <EmojiPicker
          :native="true"
          :static-texts="{
            placeholder: $t('chat.emoji.placeholder'),
            skinTone: $t('chat.emoji.skinTone')
          }"
          :group-names="{
            recent: $t('chat.emoji.groups.recent'),
            smileys_people: $t('chat.emoji.groups.smileysPeople'),
            animals_nature: $t('chat.emoji.groups.animalsNature'),
            food_drink: $t('chat.emoji.groups.foodDrink'),
            activities: $t('chat.emoji.groups.activities'),
            travel_places: $t('chat.emoji.groups.travelPlaces'),
            objects: $t('chat.emoji.groups.objects'),
            symbols: $t('chat.emoji.groups.symbols'),
            flags: $t('chat.emoji.groups.flags')
          }"
          :display-recent="true"
          @select="addEmoji"
      />
    </div>
  </div>
</template>

<script>
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

export default {
  components: {EmojiPicker},
  props: {
    editingMessage: {
      type: Object,
      default: null,
    },
  },
  emits: ["cancel-edit", "send-message"],
  data() {
    return {
      currentMessage: "",
      showEmojiPicker: false,
    };
  },
  watch: {
    editingMessage: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.currentMessage = newValue.content;
          this.focusTextarea();
        }
      },
    },
  },
  methods: {
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
      this.focusTextarea();
    },
    focusTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.messageTextarea;
        if (textarea) {
          textarea.focus();
          this.autoGrow(textarea);
        }
      });
    },
    autoGrow(textarea) {
      if (textarea) {
        textarea.style.height = "auto";
        const maxHeight = 250;
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;

        const emojiContainer = this.$refs.emojiContainer;
        if (emojiContainer) {
          emojiContainer.style.bottom = `${newHeight + 35}px`;
        }
      }
    },
    addEmoji(emoji) {
      const textarea = this.$refs.messageTextarea;

      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBefore = this.currentMessage.slice(0, cursorPosition);
        const textAfter = this.currentMessage.slice(cursorPosition);

        this.currentMessage = `${textBefore}${emoji.i}${textAfter}`;

        this.$nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + emoji.i.length;
        });
      } else {
        this.currentMessage += emoji.i;
      }
      textarea.focus();
    },
    sendMessage() {
      if (this.currentMessage.trim()) {
        this.$emit("send-message", this.currentMessage.trim());
        this.currentMessage = "";
        this.showEmojiPicker = false;
        this.$refs.messageTextarea.style.height = "auto";
      }
    },
    cancelEdit() {
      this.currentMessage = "";
      this.$emit("cancel-edit");
      this.$refs.messageTextarea.style.height = "auto";
    },
    attachFile() {
      this.$emit("attach-file");
    },
  },
};
</script>

<style scoped>
.chat-input textarea {
  resize: none;
}

.emoji-picker-container {
  position: absolute;
  bottom: 90px;
  left: 10px;
  z-index: 1050;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  overflow: auto;
}
</style>