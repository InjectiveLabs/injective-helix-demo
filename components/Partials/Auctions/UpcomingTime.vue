<script lang="ts" setup>
import { intervalToDuration, parseISO } from 'date-fns'

defineProps({
  isSlim: Boolean
})

const now = ref(Date.now())

const eventDate = parseISO('2023-08-15')

const timeFormatted = computed(() => {
  const { days, hours, minutes, seconds } = intervalToDuration({
    start: new Date(now.value).getTime(),
    end: eventDate.getTime()
  })

  return `${days}D ${hours}H ${minutes}M ${seconds}S`
})

useIntervalFn(() => {
  now.value = Date.now()
}, 1000)
</script>
<template>
  <div>
    <div v-if="isSlim" class="text-center">
      <h4 class="text-md font-semibold">Auctions Starts In</h4>
      <h3 class="text-xl font-bold">{{ timeFormatted }}</h3>
    </div>

    <div v-else>
      <p class="text-gray-400 uppercase">Auction opens in</p>
      <p class="text-4xl font-bold">{{ timeFormatted }}</p>
    </div>
  </div>
</template>
