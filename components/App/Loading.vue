<script lang="ts" setup>
withDefaults(
  defineProps<{
    isLeft: boolean
    isRight: boolean
  }>(),
  {
    isLeft: false,
    isRight: false
  }
)
</script>

<template>
  <div class="left-0 top-0 h-full w-full">
    <div
      class="h-full w-full flex items-center"
      :class="{
        'justify-start': isLeft,
        'justify-end': isRight,
        'justify-center': !isLeft && !isRight
      }"
    >
      <AssetLogoSpinner v-bind="$attrs" />
    </div>
  </div>
</template>
