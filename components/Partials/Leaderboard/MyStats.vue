<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

withDefaults(defineProps<{ isPnl?: boolean; isUnranked?: boolean }>(), {
  isPnl: false,
  isUnranked: false
})
</script>

<template>
  <div
    class="pt-4 md:pt-6 pb-7 md:pb-10 rounded-[4px] relative h-full-flex mb-10 bg-texture"
    :class="[isPnl ? 'pnl-gradient darken' : 'bg-[#1472FF] opacity']"
  >
    <div class="pl-4 md:pl-7 flex items-center space-x-2 md:space-x-4 mb-4">
      <div v-if="!isUnranked" class="flex space-x-2 items-center relative">
        <UIcon :name="NuxtUiIcons.User" class="h-7 w-7 min-w-7" />
        <p class="font-bold text-xl">{{ $t('leaderboard.myStats') }}</p>
      </div>

      <slot name="add-on" />
    </div>

    <slot name="row" />

    <div
      class="absolute top-3 right-14 sm:top-4 sm:right-16"
      :class="[isPnl ? 'text-[#FFFC4D]' : 'text-green-450']"
    >
      <div class="relative">
        <UIcon :name="NuxtUiIcons.FourPointStar" class="min-w-4 w-4 h-4" />
        <UIcon
          :name="NuxtUiIcons.FourPointStar"
          class="min-w-4 w-4 h-4 absolute top-7 left-6"
        />
        <UIcon
          :name="NuxtUiIcons.FourPointStar"
          class="min-w-6 w-6 h-6 absolute left-9 -top-1"
        />
      </div>
    </div>

    <div
      class="absolute -bottom-3 left-8 w-20 h-16 p-0 m-0 bg-opacity-80 rounded-tl-[4px]"
    >
      <img
        src="/images/leaderboard/towers.svg"
        class="w-full h-full object-contain"
      />
    </div>
  </div>
</template>

<style scoped>
.pnl-gradient {
  background: linear-gradient(90deg, #2f9bff 0%, #9747ff 100%);
}

.bg-texture:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  border-radius: 4px;
  background-image: url('/images/leaderboard/pnl-texture.jpeg');
}

.darken:before {
  mix-blend-mode: darken;
}

.opacity:before {
  opacity: 0.1;
}
</style>
