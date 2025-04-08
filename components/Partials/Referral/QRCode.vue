<script lang="ts" setup>
withDefaults(
  defineProps<{
    text: string
  }>(),
  { text: '' }
)
</script>

<template>
  <SharedQRCode
    class="max-w-56 my-4 rounded-lg"
    v-bind="{
      text,
      extraConfigs: {
        image: null,
        dotsOptions: { type: 'square' },
        cornersDotOptions: { type: 'square' },
        cornersSquareOptions: { type: 'square' }
      }
    }"
  />
</template>
