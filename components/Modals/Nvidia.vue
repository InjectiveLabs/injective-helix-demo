<script setup lang="ts">
import { onMounted } from 'vue'

const now = useNow()
const isOpen = ref(false)
const countdownTimestamp = 1741357800

const timeRemaining = computed(() => {
  const diff = countdownTimestamp - Math.floor(now.value.getTime() / 1000)
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }

  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  return { hours, minutes, seconds }
})

const formattedCountdown = computed(() => {
  const { hours, minutes, seconds } = timeRemaining.value
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

onMounted(() => {
  setTimeout(() => {
    const currentTime = Math.floor(now.value.getTime() / 1000)
    if (currentTime < countdownTimestamp) {
      isOpen.value = true
    }
  }, 3000)
})
</script>

<template>
  <SharedModal v-model="isOpen">
    <div>
      <img class="mx-auto block" src="/svg/brewing.svg" alt="" />

      <p class="text-2xl font-semibold text-center mt-4">
        {{ $t('home.somethingIsBrewing') }}
      </p>

      <p class="text-5xl font-bold text-center mt-4">
        {{ formattedCountdown }}
      </p>
    </div>
  </SharedModal>
</template>
