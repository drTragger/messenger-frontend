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
        type="button"
        icon="pi pi-paperclip"
        class="p-button-outlined mr-2"
        @click="toggleUploadPopover"
    />

    <!-- Upload Popover -->
    <Popover ref="op" class="bg-white shadow-lg rounded-lg">
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-3 w-full hover:bg-gray-100 p-2 rounded-lg transition-all cursor-pointer"
             @click="triggerImageVideoUpload"
             v-tooltip="{value: $t('chat.attachments.popover.formats', {formats: 'JPG, JPEG, PNG, GIF'}), showDelay: 1000}">
          <i class="pi pi-camera text-blue-500 text-xl"></i>
          <div class="flex flex-col">
            <span class="text-base font-medium text-gray-800">{{ $t('chat.attachments.popover.imageVideo') }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 w-full hover:bg-gray-100 p-2 rounded-lg transition-all cursor-pointer"
             @click="triggerFileUpload"
             v-tooltip="{value: $t('chat.attachments.popover.formats', {formats: 'PDF, DOC, XLS, TXT'}), showDelay: 1000}">
          <i class="pi pi-file text-green-500 text-xl"></i>
          <div class="flex flex-col">
            <span class="text-base font-medium text-gray-800">{{ $t('chat.attachments.popover.file') }}</span>
          </div>
        </div>
      </div>
    </Popover>

    <!-- Hidden File Uploads -->
    <FileUpload
        ref="imageVideoUploader"
        customUpload
        auto
        multiple
        accept="image/*,video/*"
        mode="basic"
        class="hidden"
        @select="handleImageVideoUpload"
    />
    <FileUpload
        ref="fileUploader"
        customUpload
        auto
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        mode="basic"
        class="hidden"
        @select="handleFileUpload"
    />

    <!-- PrimeVue Text Input -->
    <InputTextarea
        ref="messageTextarea"
        v-model="currentMessage"
        :placeholder="$t('chat.message.type')"
        rows="1"
        :disabled="showFileDialog"
        class="resize-none border"
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

    <!-- File Preview Modal -->
    <DialogWindow
        v-model:visible="showFileDialog"
        modal
        class="w-full lg:w-[40vw] max-h-[90vh] flex flex-col relative overflow-y-hidden transition-all"
        :closable="false"
    >
      <!-- Header Section -->
      <template #header>
        <div class="flex items-center justify-between w-full pb-4">
          <!-- Close Button -->
          <Button
              icon="pi pi-times"
              class="p-button-sm p-button-outlined"
              @click="closeFileDialog"
          />
          <span class="p-dialog-title">
            {{ $t('chat.attachments.preview') }}
          </span>
          <!-- Plus Button -->
          <Button
              icon="pi pi-plus"
              class="p-button-rounded p-button-primary"
              @click="triggerUpload"
              v-tooltip="{ value: $t('chat.attachments.add'), showDelay: 500 }"
          />
        </div>
      </template>

      <!-- Content Section -->
      <div class="overflow-y-hidden">
        <div v-if="selectedFiles.length > 0">
          <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex flex-col items-center justify-center gap-2 mb-4"
          >
            <template v-if="isImage(file)">
              <Image
                  :src="file.preview"
                  :alt="$t('notAvailable')"
                  image-class="rounded-lg object-cover"
                  :pt="{previewMask: {class: 'rounded-lg'}}"
                  class="w-full max-w-sm"
                  preview
              />
            </template>
            <template v-else-if="isVideo(file)">
              <video controls class="w-full max-w-sm rounded-lg">
                <source :src="file.preview" type="video/mp4"/>
                {{ $t('chat.attachments.video.noSupport') }}
              </video>
            </template>
            <template v-else>
              <div class="flex gap-3 items-center self-start">
                <Image :src="file.preview" :alt="$t('notAvailable')" image-class="w-12 h-12"/>
                <span class="text-gray-800 font-medium">{{ file.name }}</span>
              </div>
            </template>
            <p v-if="isImage(file) || isVideo(file)" class="text-sm text-gray-500">{{ file.name }}</p>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-full">
          <p class="text-gray-500 text-center">{{ $t('chat.attachments.empty') }}</p>
        </div>
      </div>

      <!-- Footer Section -->
      <template #footer>
        <div class="w-full flex items-end gap-2 pt-4">
          <InputTextarea
              ref="messageTextarea"
              v-model="currentCaption"
              :placeholder="$t('chat.attachments.caption')"
              rows="1"
              class="resize-none"
              @input="onInput"
              @keydown.enter.exact.prevent="sendMessage"
          />
          <Button icon="pi pi-send" class="p-button" @click="sendMessage"/>
        </div>
      </template>
    </DialogWindow>
  </div>
</template>

<script>
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import Popover from "primevue/popover";
import FileUpload from "primevue/fileupload";
import {isImage, isVideo, generateFilePreview} from "@/utils/files";

export default {
  components: {EmojiPicker, Popover, FileUpload},
  props: {
    editingMessage: {
      type: Object,
      default: null,
    },
  },
  emits: ["cancel-edit", "send-message", "attach-files"],
  data() {
    return {
      currentMessage: "",
      currentCaption: "",
      selectedFiles: [],
      showFileDialog: false,
      isImageDialog: false,
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
    isImage, isVideo, generateFilePreview,
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
      this.focusTextarea();
    },
    toggleUploadPopover(event) {
      this.$refs.op.toggle(event);
    },
    triggerUpload() {
      if (this.isImageDialog) {
        this.triggerImageVideoUpload();
      } else {
        this.triggerFileUpload();
      }
    },
    triggerImageVideoUpload() {
      this.$refs.imageVideoUploader.$el.querySelector("input[type='file']").click();
      this.$refs.op.hide();
      this.isImageDialog = true;
    },
    triggerFileUpload() {
      this.$refs.fileUploader.$el.querySelector("input[type='file']").click();
      this.$refs.op.hide();
      this.isImageDialog = false;
    },
    handleImageVideoUpload(event) {
      const files = event.files.map(file => ({
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
      }));
      this.selectedFiles.push(...files);
      this.showFileDialog = true;
    },
    handleFileUpload(event) {
      const files = event.files.map(file => ({
        file,
        name: file.name,
        preview: this.generateFilePreview(file),
      }));
      this.selectedFiles.push(...files);
      this.showFileDialog = true;
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
      this.focusTextarea();
    },
    sendMessage() {
      if (!this.currentMessage.trim() && !this.currentCaption.trim() && this.selectedFiles.length < 0) return;

      this.$emit("send-message", {
        text: this.currentMessage.trim() || this.currentCaption.trim(),
        attachments: this.selectedFiles.map(file => file.file),
      });
      this.currentMessage = "";
      this.currentCaption = "";
      this.selectedFiles = [];
      this.showEmojiPicker = false;
      this.$refs.messageTextarea.$el.style.height = "auto";
      this.closeFileDialog();
    },
    cancelEdit() {
      this.currentMessage = "";
      this.$emit("cancel-edit");
      this.$refs.messageTextarea.$el.style.height = "auto";
    },
    closeFileDialog() {
      this.currentCaption = "";
      this.selectedFiles = [];
      this.showFileDialog = false;
      this.isImageDialog = false;
    },
  },
};
</script>
