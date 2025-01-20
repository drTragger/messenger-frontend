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
              :preview="true"
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
          <p
              class="text-sm text-blue-500 hover:underline cursor-pointer flex items-center space-x-1"
              @click="triggerFileInput"
          >
            <i class="pi pi-pencil"></i>
            <span>{{ $t('settings.profilePicture.hint') }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Personal Information Section -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <h5 class="text-lg font-semibold mb-4">{{ $t('settings.personalInfo.title') }}</h5>
      <form @submit.prevent="savePersonalInfo" novalidate>
        <!-- General Error -->
        <Message
            v-if="generalError"
            severity="error"
            :content="generalError"
            class="mb-4"
        >
          {{ generalError }}
        </Message>

        <div class="mb-4">
          <GeneralInput
              v-model="firstName"
              :label="$t('settings.personalInfo.firstName.label')"
              :placeholder="$t('settings.personalInfo.firstName.placeholder')"
              :error-message="validationErrors.firstname"
              id="name-first"
              type="text"
          />
        </div>

        <div class="mb-4">
          <GeneralInput
              v-model="lastName"
              :label="$t('settings.personalInfo.lastName.label')"
              :placeholder="$t('settings.personalInfo.lastName.placeholder')"
              :error-message="validationErrors.lastname"
              id="name-last"
              type="text"
          />
        </div>

        <div class="text-right">
          <Button type="submit" class="p-button p-button-primary">
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
import {useI18n} from "vue-i18n";
import {useToast} from "primevue";
import Cropper from "cropperjs";
import apiClient from "@/utils/api";
import {authStore, logoutUser} from "@/utils/auth";
import {getWebSocketManager} from "@/utils/websocket/websocket";
import AvatarPic from "@/components/AvatarPic.vue";
import GeneralInput from "@/components/GeneralInput.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import PageHeader from "@/components/PageHeader.vue";
import "cropperjs/dist/cropper.css";

export default {
  components: {GeneralInput, PageHeader, LanguageSwitcher, AvatarPic},
  setup() {
    const {locale} = useI18n();
    const toast = useToast();
    return {
      authStore,
      apiClient,
      locale,
      toast,
    };
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      language: null,
      isCropperVisible: false,
      cropper: null,
      imagePreview: null, // The selected image preview
      croppedImage: null, // The final cropped image blob
      validationErrors: {},
      generalError: null,
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
      this.firstName = userData.firstName;
      this.lastName = userData.lastName;
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

            this.toast.add({
              severity: 'success',
              summary: this.$t('toast.summary.success'),
              detail: this.$t('settings.profilePicture.success'),
              life: 3000,
            });
          } catch (error) {
            this.toast.add({
              severity: 'error',
              summary: this.$t('toast.summary.error'),
              detail: error.response?.data || error.message,
              life: 3000,
            });
          }
        });
      }
    },
    async savePersonalInfo() {
      if (this.firstName.length < 1) {
        this.validationErrors.firstname = this.$t('validation.required');
        return;
      }
      try {
        const response = await apiClient.patch("/users/personal-info", {
          firstName: this.firstName,
          lastName: this.lastName
        }, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        authStore.user.firstName = response.data.data.firstName;
        authStore.user.lastName = response.data.data.lastName;

        this.toast.add({
          severity: 'success',
          summary: this.$t('toast.summary.success'),
          detail: this.$t('settings.personalInfo.success'),
          life: 3000,
        });
      } catch (error) {
        if (error.response?.data?.fields) {
          this.validationErrors = error.response.data.fields;
        } else {
          this.generalError = error.response?.data?.message || this.$t("errors.unexpected");
        }
      }
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
