<script lang="ts" setup>
withDefaults(
  defineProps<{
    rows?: number
    wrapperClass?: string
  }>(),
  {
    rows: 6,
    wrapperClass: ''
  }
)
</script>
<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div class="textarea-wrapper flex items-center gap-2" :class="[wrapperClass]">
    <SharedTextArea :rows="rows" v-bind="$attrs" />
  </div>
</template>

<style scoped>
.textarea {
  @apply px-2 py-3 text-sm text-gray-200 w-full;

  &-wrapper {
    @apply shadow-sm bg-gray-950 rounded;
  }

  &::placeholder {
    @apply opacity-75;
  }
}
</style>
