<script setup lang="ts">
defineProps({
  isBuy: Boolean,

  index: {
    type: Number,
    required: true
  }
})

const randomWidth = Math.floor(Math.random() * 50) + 50
const randomWidth2 = Math.floor(Math.random() * 50) + 20
const randomWidth3 = Math.floor(Math.random() * 50) + 30
</script>

<template>
  <div
    :style="{ animationDelay: index * 50 + 'ms' }"
    class="h-[16px] flex py-[3px] animate-pulse [animation-duration:1s]"
  >
    <div class="flex-1 shrink-0 flex justify-end">
      <div
        :style="{ width: randomWidth + 'px' }"
        class="h-full rounded"
        :class="[isBuy ? 'bg-green-500/20' : 'bg-red-500/20']"
      />
    </div>

    <div class="flex-1 shrink-0 flex justify-end">
      <div
        :style="{ width: randomWidth2 + 'px' }"
        class="h-full bg-brand-800/80 rounded"
      ></div>
    </div>

    <div class="flex-1 shrink-0 flex justify-end">
      <div
        :style="{ width: randomWidth3 + 'px' }"
        class="h-full bg-brand-800/80 rounded"
      ></div>
    </div>
  </div>
</template>
