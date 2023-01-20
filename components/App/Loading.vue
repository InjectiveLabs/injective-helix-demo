<script lang="ts" setup>
defineProps({
  left: Boolean,
  right: Boolean
})
</script>

<template>
  <div class="left-0 top-0 h-full w-full">
    <div
      class="h-full w-full flex items-center"
      :class="{
        'justify-start': left,
        'justify-end': right,
        'justify-center': !left && !right
      }"
    >
      <AssetLogoSpinner v-bind="$attrs" />
    </div>
  </div>
</template>
