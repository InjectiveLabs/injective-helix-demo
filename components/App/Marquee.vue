<script setup lang="ts">
//
</script>

<template>
  <div class="marquee">
    <div class="marquee-content">
      <slot />
    </div>
  </div>
</template>

<style>
.marquee {
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
}

.marquee-content {
  display: inline-block;

  animation: marquee 300s linear infinite;
}

.marquee-content:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  0% {
    padding-left: 100%;
    transform: translateX(0%);
  }
  100% {
    padding-left: 0%;
    transform: translateX(-100%);
  }
}
</style>
