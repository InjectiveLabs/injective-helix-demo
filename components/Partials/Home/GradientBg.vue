<script setup lang="ts">
const isLoaded = ref(false)

onMounted(() => {
  const video = document.createElement('video')
  video.src = '/helix_bg.mp4'
  video.autoplay = true
  video.loop = true
  video.muted = true
  video.playsInline = true
  video.onloadeddata = () => {
    isLoaded.value = true
  }
})
</script>
<template>
  <div v-if="isLoaded" class="relative -mt-[56px] animate-fade-in">
    <video
      class="absolute inset-0 w-full h-screen object-cover"
      src="/helix_bg.mp4"
      autoplay
      loop
      muted
      playsinline
    />
    <div
      class="absolute inset-0 bg-gradient-to-t w-full h-screen from-[#00001A] to-transparent"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 1s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
