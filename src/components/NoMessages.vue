<template>
  <div class="flex flex-col items-center justify-center text-center grow">
    <!-- Picture -->
    <Image
        :src="require('@/assets/pictures/dancing-duck.gif')"
        :alt="$t('notAvailable')"
        image-class="w-50 h-50 mb-4"
    />

    <!-- Message -->
    <h3 v-if="!!title" class="text-lg font-semibold text-gray-700">
      {{ title }}
    </h3>
    <p v-if="!!subtitle" class="text-sm text-gray-500">
      {{ subtitle }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'NoMessages',
  props: {
    title: {type: String, required: false},
    subtitle: {type: String, required: false},
  }
}
</script>
