<script setup lang="ts">
const N_OF_BALLS = 20
</script>

<template>
  <div
    class="h-full flex relative justify-center items-center scale-100 opacity-80"
  >
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-32 bg-blue-300/10 blur-[6rem]"
    ></div>
    <div>
      <div class="flex p-4 space-x-px flex-1">
        <div
          v-for="i in N_OF_BALLS"
          :key="i"
          :style="{ animationDelay: `-${i * 0.15}s` }"
          class="h-3 w-3 bg-[#9593ff] rounded-full up-down"
        />
      </div>

      <div class="flex p-4 space-x-px center flex-1 -translate-y-[40px]">
        <div
          v-for="i in N_OF_BALLS"
          :key="i"
          :style="{
            animationDelay: `-${i * 0.15 + 0.15 * (N_OF_BALLS / 4)}s`
          }"
          class="h-3 w-3 bg-[#9593ff] rounded-full up-down"
        />
      </div>
    </div>
  </div>
</template>

<style>
.up-down {
  animation:
    up-down 1.7s infinite ease-in-out,
    opacity 1.7s infinite ease-in-out;
}

@keyframes up-down {
  0% {
    transform: translateY(-40px);
  }

  50% {
    transform: translateY(40px);
  }

  100% {
    transform: translateY(-40px);
  }
}

@keyframes opacity {
  0% {
    opacity: 1;
  }

  25% {
    opacity: 0;
    scale: 0.6;
  }

  50% {
    opacity: 1;
  }

  75% {
    opacity: 1;
  }

  100% {
    opacity: 1;
  }
}
</style>
