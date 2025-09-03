<script setup lang="ts">
const videoRef = ref<null | HTMLVideoElement>(null)

onMounted(() => {
  const source = document.createElement('source')
  source.src = '/helix_bg.mp4'
  source.type = 'video/mp4'

  if (videoRef.value) {
    videoRef.value.appendChild(source)
    videoRef.value.load()
  }
})
</script>

<template>
  <div class="absolute h-screen inset-0 w-full animate-fade-in">
    <video
      ref="videoRef"
      loop
      muted
      autoplay
      playsinline
      poster="/helix-bg-poster.webp"
      class="absolute inset-0 w-full h-full object-cover"
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
