<script lang="ts" setup>
defineProps({
  bgLighter: Boolean
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-12 z-10">
      <slot name="actions" />
    </div>

    <div
      :class="{
        'card-table-wrap-content': !bgLighter,
        'card-table-wrap-content-lighter': bgLighter
      }"
      class="overflow-y-hidden"
    >
      <div class="h-full relative">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
