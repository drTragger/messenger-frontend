<template>
  <Button
      v-if="isVisible"
      class="fixed bottom-24 right-4 shadow-xl flex items-center justify-center text-white transition-transform transform hover:scale-110 active:scale-95"
      @click="scrollToBottom"
      style="
        background: linear-gradient(135deg, #6dd5ed, #2193b0);
        border-radius: 100% !important;
        padding: 0 !important;
        border: none !important;
      "
  >
    <div class="w-10 h-10 flex shadow-lg items-center justify-center rounded-full">
      <i class="pi pi-arrow-down text-xl"></i>
    </div>
  </Button>
</template>

<script>
export default {
  props: {
    target: {
      type: String,
      default: "body",
    },
    threshold: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      isVisible: false,
    };
  },
  mounted() {
    this.targetElement = this.target === "body"
        ? document.documentElement
        : document.querySelector(this.target);

    if (this.targetElement) {
      this.targetElement.addEventListener("scroll", this.checkVisibility);
    }
  },
  beforeUnmount() {
    if (this.targetElement) {
      this.targetElement.removeEventListener("scroll", this.checkVisibility);
    }
  },
  methods: {
    checkVisibility() {
      const isAtBottom =
          this.targetElement.scrollTop + this.targetElement.clientHeight >=
          this.targetElement.scrollHeight - this.threshold;

      this.isVisible = !isAtBottom;
    },
    scrollToBottom() {
      this.targetElement.scrollTo({
        top: this.targetElement.scrollHeight,
        behavior: "smooth",
      });
    },
  },
};
</script>