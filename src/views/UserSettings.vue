<template>
  <div class="container mx-auto my-10 space-y-6">
    <div class="relative">
      <!-- Back Button -->
      <Button
          icon="pi pi-arrow-left"
          class="p-button-outlined p-button-sm absolute left-0"
          @click="goBack"
      />

      <!-- Header -->
      <PageHeader :title="$t('settings.title')" :subtitle="$t('settings.subtitle')"/>
    </div>

    <!-- Profile Picture Section -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <div class="flex items-center space-x-4">
        <div>
          <AvatarPic
              :profilePicture="authStore.user?.profilePicture"
              :isOnline="false"
              class="cursor-pointer"
              @click="triggerFileInput"
          />
          <input
              type="file"
              ref="profilePictureInput"
              class="hidden"
              @change="showCropper"
          />
        </div>
        <div>
          <h5 class="text-lg font-semibold">{{ $t('settings.profilePicture.title') }}</h5>
          <p class="text-sm text-gray-500">{{ $t('settings.profilePicture.hint') }}</p>
        </div>
      </div>
    </div>

    <!-- Personal Information Section -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <h5 class="text-lg font-semibold mb-4">{{ $t('settings.personalInfo.title') }}</h5>
      <form @submit.prevent="savePersonalInfo">
        <div class="mb-4">
          <label for="name-of-user" class="block text-sm font-medium text-gray-700">
            {{ $t('settings.personalInfo.name.label') }}
          </label>
          <InputText
              v-model="userName"
              id="name-of-user"
              :placeholder="$t('settings.personalInfo.name.placeholder')"
              autocomplete="new-password"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              class="w-full mt-1 p-inputtext border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div class="text-right">
          <Button class="p-button p-button-primary">
            {{ $t('settings.personalInfo.button') }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Language Section -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <h5 class="text-lg font-semibold mb-4">{{ $t('settings.language') }}</h5>
      <LanguageSwitcher/>
    </div>

    <!-- Logout Section -->
    <div class="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
      <h5 class="text-lg font-semibold">{{ $t('settings.logout') }}</h5>
      <Button class="p-button p-button-danger" @click="logout">
        {{ $t('login.logout') }}
      </Button>
    </div>

    <!-- Cropper Dialog -->
    <DialogWindow v-model:visible="isCropperVisible" :header="$t('settings.profilePicture.resize')" :modal="true"
                  :closable="false" class="w-full max-w-3xl">
      <div>
        <div ref="cropperContainer" class="cropper-wrapper">
          <img :src="imagePreview" ref="imageCropper" alt="Img" class="cropper-image"/>
        </div>
        <div class="flex justify-end mt-4 space-x-4">
          <Button class="p-button-outlined" @click="cancelCropper">{{ $t('cancel') }}</Button>
          <Button class="p-button-primary" @click="uploadCroppedImage">{{ $t('save') }}</Button>
        </div>
      </div>
    </DialogWindow>
  </div>
</template>

<script>
import {authStore, logoutUser} from "@/utils/auth";
import apiClient from "@/utils/api";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import {useI18n} from "vue-i18n";
import AvatarPic from "@/components/AvatarPic.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import PageHeader from "@/components/PageHeader.vue";

export default {
  components: {PageHeader, LanguageSwitcher, AvatarPic},
  setup() {
    const {locale} = useI18n();
    return {
      authStore,
      apiClient,
      locale,
    };
  },
  data() {
    return {
      userName: "",
      language: null,
      isCropperVisible: false,
      cropper: null,
      imagePreview: null, // The selected image preview
      croppedImage: null, // The final cropped image blob
    };
  },
  async created() {
    this.language = this.locale;

    try {
      const response = await apiClient.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      const userData = response.data.data;

      authStore.user = userData;
      this.userName = userData.username;
    } catch (error) {
      console.error("Error fetching user data:", error.response?.data || error.message);
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.profilePictureInput.click();
    },
    goBack() {
      this.$router.back();
    },
    showCropper(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
          this.isCropperVisible = true;
          this.$nextTick(() => this.initCropper());
        };
        reader.readAsDataURL(file);
      }
    },
    initCropper() {
      const imageElement = this.$refs.imageCropper;
      if (this.cropper) {
        this.cropper.destroy();
      }
      this.cropper = new Cropper(imageElement, {
        aspectRatio: 1,
        viewMode: 2,
        dragMode: "crop",
        autoCropArea: 1,
      });
    },
    cancelCropper() {
      this.isCropperVisible = false;
      this.imagePreview = null;
      this.croppedImage = null;
      if (this.cropper) {
        this.cropper.destroy();
        this.cropper = null;
      }
    },
    uploadCroppedImage() {
      if (this.cropper) {
        this.cropper.getCroppedCanvas().toBlob(async (blob) => {
          try {
            this.croppedImage = blob; // Blob for uploading
            this.isCropperVisible = false;

            const originalFileName = this.$refs.profilePictureInput.files[0].name;
            const fileNameParts = originalFileName.split(".");
            const extension = fileNameParts[fileNameParts.length - 1]; // Get the original extension
            const newFileName = `cropped-${Date.now()}.${extension}`; // Generate a new unique file name

            // Prepare the FormData for the request
            const formData = new FormData();
            formData.append("picture", this.croppedImage, newFileName);

            // Send the PATCH request using apiClient
            const response = await apiClient.patch("/users/profile-picture", formData, {
              headers: {
                Authorization: `Bearer ${authStore.token}`,
                "Content-Type": "multipart/form-data",
              },
            });
            authStore.user.profilePicture = response.data.data.profilePicture;

            this.cancelCropper();
          } catch (error) {
            console.error("Error uploading profile picture:", error.response?.data || error.message);
          }
        });
      }
    },
    savePersonalInfo() {
      console.log(`Name updated: ${this.userName}`);
    },
    async logout() {
      await logoutUser(this.$router);
      const wsManager = getWebSocketManager(process.env.APP_VUE_WS_URL, authStore.token);
      wsManager.disconnect();
    },
  },
};
</script>

<style scoped>
.cropper-wrapper {
  width: 100%;
  height: 70vh; /* Fit within modal */
  overflow: hidden; /* Prevent overflow */
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Ensures image is scaled appropriately */
}
</style>
