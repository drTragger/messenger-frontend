<template>
  <div class="text-center mb-8">
    <h1 class="text-blue-500 font-bold text-3xl">{{ title }}</h1>
    <p class="text-gray-500">{{ subtitle }}</p>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {type: String, required: true},
    subtitle: {type: String, required: true},
  }
}
</script>
