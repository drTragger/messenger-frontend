<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <InputText
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :class="{ 'p-invalid': !!localErrorMessage }"
        :id="id"
        required
        class="mt-1 block w-full"
        @input="onInput"
    />
    <Message v-if="localErrorMessage" severity="error" variant="simple" size="small">{{ localErrorMessage }}</Message>
  </div>
</template>

<script>
export default {
  name: "GeneralInput",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "input",
    },
    errorMessage: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      inputValue: this.modelValue,
      localErrorMessage: this.errorMessage,
    };
  },
  watch: {
    modelValue(newValue) {
      this.inputValue = newValue;
    },
    errorMessage(newValue) {
      this.localErrorMessage = newValue;
    },
  },
  methods: {
    onInput(event) {
      this.inputValue = event.target.value;
      this.localErrorMessage = ""; // Reset error when user types
      this.$emit("update:modelValue", this.inputValue);
    },
    setErrorMessage(message) {
      this.localErrorMessage = message; // Set error message manually
    },
  },
};
</script>

<style scoped>
</style>