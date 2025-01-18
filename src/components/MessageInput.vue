<template>
  <div class="flex items-end py-4 px-3 bg-gray-100 shadow-md relative">
    <!-- Emoji Picker Button -->
    <Button
        icon="pi pi-face-smile"
        class="p-button-outlined mr-2"
        :class="{ 'p-button-info': showEmojiPicker }"
        @click="toggleEmojiPicker"
    />

    <!-- File Attachment Button -->
    <Button
        icon="pi pi-paperclip"
        class="p-button-outlined mr-2"
        @click="attachFile"
    />

    <!-- PrimeVue Text Input -->
    <InputTextarea
        ref="messageTextarea"
        v-model="currentMessage"
        :placeholder="$t('chat.message.type')"
        rows="1"
        class="resize-none"
        @input="onInput"
        @keydown.enter.exact.prevent="sendMessage"
    />

    <!-- Send Button -->
    <Button
        icon="pi pi-send"
        class="p-button ml-2"
        @click="sendMessage"
    />

    <!-- Cancel Edit Button -->
    <Button
        v-if="editingMessage"
        icon="pi pi-times"
        class="p-button-outlined ml-2"
        @click="cancelEdit"
    />

    <!-- Emoji Picker -->
    <div v-if="showEmojiPicker" ref="emojiContainer" class="absolute z-50 bottom-20">
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
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";

export default {
  components: { EmojiPicker },
  props: {
    editingMessage: {
      type: Object,
      default: null,
    },
  },
  emits: ["cancel-edit", "send-message", "attach-file"],
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
        const textarea = this.$refs.messageTextarea?.$el;
        if (textarea) {
          textarea.focus();
          this.onInput();
        }
      });
    },
    onInput() {
      const textarea = this.$refs.messageTextarea?.$el;
      if (textarea) {
        textarea.style.height = "auto";
        const maxHeight = 250;
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;

        const emojiContainer = this.$refs.emojiContainer;
        if (emojiContainer) {
          emojiContainer.style.setProperty('bottom', `${newHeight + 35}px`, 'important');
        }
      }
    },
    addEmoji(emoji) {
      const textarea = this.$refs.messageTextarea?.$el;

      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        console.log(cursorPosition);
        const textBefore = this.currentMessage.slice(0, cursorPosition);
        const textAfter = this.currentMessage.slice(cursorPosition);

        this.currentMessage = `${textBefore}${emoji.i}${textAfter}`;

        this.$nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd =
              cursorPosition + emoji.i.length;
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
        this.$refs.messageTextarea.$el.style.height = "auto";
      }
    },
    cancelEdit() {
      this.currentMessage = "";
      this.$emit("cancel-edit");
      this.$refs.messageTextarea.$el.style.height = "auto";
    },
    attachFile() {
      this.$emit("attach-file");
    },
  },
};
</script>
