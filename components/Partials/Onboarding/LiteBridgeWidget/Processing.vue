<script setup lang="ts">
const emit = defineEmits<{
  'transfer:success': []
}>()

const countdown = ref(10) // 10 seconds
const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

let interval: NodeJS.Timeout

onMounted(() => {
  interval = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(interval)
      emit('transfer:success')
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="flex flex-col items-center justify-center space-y-4 py-10">
    <img src="/svg/paper-plane.svg" class="max-w-[200px] w-full mx-auto" />
    <p class="text-xl font-semibold">
      {{ $t('onboarding.processing') }}
    </p>
    <p class="text-2xl">{{ formattedCountdown }}s</p>
  </div>
</template>
