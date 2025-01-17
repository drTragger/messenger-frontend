<template>
  <div class="chat-header d-flex align-items-center justify-content-between py-3 px-5 bg-body-secondary">
    <div class="d-flex align-items-center">
      <button class="btn btn-outline-primary btn-sm me-3" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </button>
      <AvatarPic :profilePicture="profilePicture"/>
      <div>
        <h5 class="mb-0">{{ username || $t('chat.title') }}</h5>
        <small class="text-muted">
          <span v-if="isOnline" class="text-primary">
            {{ $t('chat.online') }}
          </span>
          <span v-else>
            {{
              $t('chat.lastSeen')
            }}: {{ lastSeen ? formatLastSeen(lastSeen) : $t('notAvailable') }}
          </span>
        </small>
      </div>
    </div>
    <button class="btn btn-outline-secondary btn-sm">
      <i class="bi bi-three-dots"></i>
    </button>
  </div>
</template>

<script>
import {formatLastSeen} from "@/utils/formatTime";
import AvatarPic from "@/components/AvatarPic.vue";

export default {
  components: {AvatarPic},
  props: {
    username: String,
    profilePicture: String,
    isOnline: Boolean,
    lastSeen: String,
  },
  methods: {
    formatLastSeen,
    goBack() {
      this.$router.push({name: "HomePage"});
    },
  },
};
</script>
