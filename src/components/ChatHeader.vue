<template>
  <div class="flex items-center justify-between py-3 px-5 bg-gray-100 shadow-md">
    <!-- Back Button and User Info -->
    <div class="flex items-center">
      <!-- Back Button -->
      <Button
          icon="pi pi-arrow-left"
          class="p-button-outlined p-button-sm mr-7"
          @click="goBack"
      />
      <!-- Avatar and User Info -->
      <AvatarPic :user="user" :profilePicture="user?.profilePicture"/>
      <div>
        <h5 class="text-lg font-semibold text-gray-800 mb-0">
          {{ getUserName() || $t('chat.title') }}
        </h5>
        <small class="text-gray-500">
          <span v-if="user?.isOnline" class="text-blue-500">
            {{ $t('chat.online') }}
          </span>
          <span v-else>
            {{ $t('chat.lastSeen') }}: {{ user?.lastSeen ? formatLastSeen(user.lastSeen) : $t('notAvailable') }}
          </span>
        </small>
      </div>
    </div>

    <!-- Options Button -->
    <Button
        icon="pi pi-ellipsis-v"
        class="p-button-outlined p-button-sm"
    />
  </div>
</template>

<script>
import { formatLastSeen } from "@/utils/formatTime";
import AvatarPic from "@/components/AvatarPic.vue";

export default {
  components: {AvatarPic},
  props: {
    user: {type: JSON, required: true},
  },
  methods: {
    formatLastSeen,
    goBack() {
      this.$router.push({ name: "HomePage" });
    },
    getUserName() {
      if (this.user?.firstName) {
        let username = '';
        username = this.user.firstName;
        if (this.user?.lastName) {
          username += ' ' + this.user.lastName;
        }
        return username;
      }
      return this.user?.username;
    },
  },
};
</script>
