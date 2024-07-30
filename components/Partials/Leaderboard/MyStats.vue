<script lang="ts" setup>
defineProps({
  isPnl: Boolean
})
</script>

<template>
  <div
    class="pt-4 md:pt-6 pb-7 md:pb-10 rounded-[4px] relative h-flex-full mb-10 bg-texture"
    :class="[isPnl ? 'pnl-gradient darken' : 'bg-[#1472FF] opacity']"
  >
    <div class="pl-4 md:pl-7 flex items-center space-x-2 md:space-x-4 mb-4">
      <div class="flex space-x-2 items-center relative">
        <SharedIcon name="user-filled" class="min-w-4 w-4 h-4" />
        <p class="font-bold text-xl">{{ $t('leaderboard.myStats') }}</p>
      </div>

      <slot name="add-on" />
    </div>

    <slot name="row" />

    <div
      class="absolute top-4 right-16"
      :class="[isPnl ? 'text-[#FFFC4D]' : 'text-green-450']"
    >
      <div class="relative">
        <SharedIcon name="star-four-point" class="min-w-4 w-4 h-4" />
        <SharedIcon
          name="star-four-point"
          class="min-w-4 w-4 h-4 absolute top-7 left-6"
        />
        <SharedIcon
          name="star-four-point"
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
