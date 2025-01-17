<template>
  <div class="container mt-5">
    <!-- Header -->
    <div class="text-center mb-4">
      <h1 class="text-primary">{{ $t('settings.title') }}</h1>
      <p class="text-muted">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Profile Picture Section -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body d-flex align-items-center">
        <div>
          <AvatarPic :profilePicture="authStore.user?.profilePicture" :isOnline="false" @click="triggerFileInput"/>
          <input
              type="file"
              ref="profilePictureInput"
              class="d-none"
              @change="showCropper"
          />
        </div>
        <div>
          <h5 class="card-title">{{ $t('settings.profilePicture.title') }}</h5>
          <small class="text-muted">{{ $t('settings.profilePicture.hint') }}</small>
        </div>
      </div>
    </div>

    <!-- Personal Information Section -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <h5 class="card-title">{{ $t('settings.personalInfo.title') }}</h5>
        <form @submit.prevent="savePersonalInfo">
          <div class="mb-3">
            <label for="userName" class="form-label">{{ $t('settings.personalInfo.name.label') }}</label>
            <input
                type="text"
                id="userName"
                autocomplete="new-password"
                spellcheck="false"
                v-model="userName"
                class="form-control"
                :placeholder="$t('settings.personalInfo.name.placeholder')"
            />
          </div>
          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-primary">
              {{ $t('settings.personalInfo.button') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Language Section -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <h5 class="card-title">{{ $t('settings.language') }}</h5>
        <LanguageSwitcher variant="settings"/>
      </div>
    </div>

    <!-- Logout Section -->
    <div class="card shadow-sm">
      <div class="card-body d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">{{ $t('settings.logout') }}</h5>
        <button class="btn btn-danger" @click="logout">
          {{ $t('login.logout') }}
        </button>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="isCropperVisible" :header="$t('settings.profilePicture.resize')" :modal="true"
          :closable="false" class="custom-modal">
    <div>
      <div ref="cropperContainer" class="cropper-wrapper">
        <img :src="imagePreview" ref="imageCropper" alt="Img" class="cropper-image"/>
      </div>
      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-outline-secondary me-2" @click="cancelCropper">{{ $t('cancel') }}</button>
        <button class="btn btn-primary" @click="uploadCroppedImage">{{ $t('save') }}</button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import {authStore, logoutUser} from "@/utils/auth";
import apiClient from "@/utils/api";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import {useI18n} from "vue-i18n";
import AvatarPic from "@/components/AvatarPic.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import {Dialog} from "primevue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

export default {
  components: {LanguageSwitcher, AvatarPic, Dialog},
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
      userName: authStore.user?.username || "",
      language: null,
      isCropperVisible: false,
      cropper: null,
      imagePreview: null, // The selected image preview
      croppedImage: null, // The final cropped image blob
    };
  },
  created() {
    this.language = this.locale;
  },
  methods: {
    triggerFileInput() {
      this.$refs.profilePictureInput.click();
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
    changeLanguage() {
      this.locale.value = this.language;
      localStorage.setItem("selectedLanguage", this.language);
      location.reload();
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
.custom-modal {
  max-width: 800px;
  max-height: 90vh;
}

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