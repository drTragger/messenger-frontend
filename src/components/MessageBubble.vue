<template>
  <div :id="`message-${message.id}`" class="flex" :class="containerClasses" ref="messageRef">
    <div
        class="message-bubble rounded-2xl py-2 px-4 max-w-[45vw]"
        :class="bubbleClasses"
        @contextmenu.prevent="emitContextMenuEvent"
    >
      <!-- Parent message-->
      <div v-if="message.parent" class="reply-preview mb-2 p-1 rounded-lg bg-white bg-opacity-20">
        <div class="flex items-center gap-2 mb-1">
          <i class="pi pi-reply text-gray-700"></i>
          <span class="text-xs">{{ message.sender?.username }}</span>
        </div>
        <p class="text-sm text-white truncate">{{ message.parent.content }}</p>
      </div>

      <!-- Attachments Section -->
      <div v-if="hasAttachments" class="mb-2">
        <div
            v-for="attachment in message.attachments"
            :key="attachment.id"
            class="mb-2 relative"
        >
          <template v-if="isImage(attachment)">
            <!-- Lazy Loaded Image with Loader -->
            <div class="relative min-w-80 min-h-52">
              <div v-if="loadingAttachments[attachment.id]"
                   class="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
                                 animationDuration="1s" aria-label="Custom ProgressSpinner"/>
              </div>
              <Image
                  :src="getAttachmentUrl(attachment, this.message)"
                  :alt="attachment.fileName"
                  preview
                  class="w-full max-w-80 max-h-[60vh]"
                  :pt="{ previewMask: { class: 'rounded-lg' } }"
                  image-class="rounded-lg object-cover"
                  @load="onAttachmentLoad(attachment.id)"
                  @error="onAttachmentError(attachment.id)"
              />
            </div>
          </template>
          <template v-else-if="isVideo(attachment)">
            <!-- Lazy Loaded Video with Loader -->
            <div class="relative min-w-80 min-h-52">
              <div v-if="loadingAttachments[attachment.id]"
                   class="absolute inset-0 flex items-center justify-center bg-gray-300 rounded-lg">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
                                 animationDuration="1s" aria-label="Custom ProgressSpinner"/>
              </div>
              <video
                  controls
                  class="w-full max-w-80 max-h-[60vh] rounded-lg cursor-pointer"
                  @canplay="onAttachmentLoad(attachment.id)"
                  @error="onAttachmentError(attachment.id)"
              >
                <source :src="getAttachmentUrl(attachment, this.message)" type="video/mp4"/>
                {{ $t('chat.attachments.video.noSupport') }}
              </video>
            </div>
          </template>
          <template v-else>
            <!-- Other File Types -->
            <a
                :href="getAttachmentUrl(attachment, this.message)"
                target="_blank"
                class="flex gap-4 items-center py-2 max-w-80 max-h-[60vh]"
                :title="attachment.fileName"
            >
              <!-- File Icon/Thumbnail -->
              <div class="flex-shrink-0">
                <Image
                    :src="generateFilePreview(attachment)"
                    image-class="w-12 h-12 rounded-lg object-cover"
                />
              </div>

              <!-- File Details -->
              <div class="flex flex-col truncate">
                <span class="font-medium truncate">
                  {{ truncateFileName(attachment.fileName) }}
                </span>
                <span class="text-sm">
                  {{ formatFileSize(attachment.fileSize) }}
                </span>
              </div>
            </a>
          </template>
        </div>
      </div>

      <!-- Message Content -->
      <div class="message-content" v-html="formattedMessageContent"></div>

      <!-- Time and Read Status -->
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
import {isImage, isVideo, generateFilePreview, getAttachmentUrl, truncateFileName, formatFileSize} from "@/utils/files";

export default {
  props: {
    message: {type: JSON, required: true},
    isMine: {type: Boolean, default: false},
    isEnglishLocale: {type: Boolean, default: false},
  },
  data() {
    return {
      loadingAttachments: {},
    }
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
    hasAttachments() {
      return Array.isArray(this.message.attachments) && this.message.attachments.length > 0;
    },
  },
  created() {
    this.setLoadingStateForAttachments();
  },
  mounted() {
    this.observeMessage();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    formatTime,
    isImage, isVideo, generateFilePreview, getAttachmentUrl, truncateFileName, formatFileSize,
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

      this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                  document.hasFocus() &&
                  entry.isIntersecting &&
                  !this.message.readAt &&
                  !this.isMine
              ) {
                this.$emit("mark-as-read", this.message.id);
              }
            });
          },
          {
            root: document.querySelector(".messages-container"),
            threshold: 0.5,
          }
      );

      this.observer.observe(this.$refs.messageRef);

      this.recheckVisibility = () => {
        if (!document.hidden && this.$refs.messageRef) {
          const rect = this.$refs.messageRef.getBoundingClientRect();
          const isInViewport =
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <=
              (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <= (window.innerWidth || document.documentElement.clientWidth);

          if (isInViewport && !this.message.readAt && !this.isMine) {
            this.$emit("mark-as-read", this.message.id);
          }
        }
      };

      document.addEventListener("visibilitychange", this.recheckVisibility);
      window.addEventListener("focus", this.recheckVisibility);
    },
    setLoadingStateForAttachments() {
      // Initialize loading state for all attachments
      if (this.hasAttachments) {
        this.message.attachments.forEach((attachment) => {
          this.loadingAttachments[attachment.id] = true; // Mark as loading initially
        });
      }
    },
    onAttachmentLoad(attachmentId) {
      this.loadingAttachments[attachmentId] = false;
    },
    onAttachmentError(attachmentId) {
      console.error(`Failed to load attachment with ID: ${attachmentId}`);
      this.loadingAttachments[attachmentId] = false;
    },
  },
};
</script>

<style scoped>
.fade-out {
  animation: fadeOut 0.3s forwards;
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
</style>