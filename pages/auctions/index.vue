<script setup lang="ts">
import { parseISO, intervalToDuration } from 'date-fns'

const nowDate = ref(Date.now())
const eventDate = parseISO('2023-08-03')

const timeFormatted = computed(() => {
  const { days, hours, minutes, seconds } = intervalToDuration({
    start: new Date(nowDate.value).getTime(),
    end: eventDate.getTime()
  })

  return `${days}D ${hours}H ${minutes}M ${seconds}S`
})

useIntervalFn(() => {
  nowDate.value = Date.now()
}, 1000)
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 min-h-screen">
    <div class="flex flex-col items-center pt-20 space-y-6">
      <h1 class="text-4xl font-bold">Auctions</h1>
      <p class="text-lg max-w-lg text-center">
        An orderbook auction platform for new projects to raise capital and for
        the community to participate in projects on Injective.
      </p>

      <NuxtLink
        to="/auctions/talis"
        class="grid grid-cols-1 md:grid-cols-2 bg-gray-900 rounded-2xl overflow-hidden w-full max-w-lg group"
      >
        <div class="bg-white p-4 grid place-items-center overflow-hidden">
          <img
            src="/images/talis-logo.svg"
            alt=""
            class="group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div>
          <div class="flex justify-end p-6 pb-0">
            <p
              class="bg-orange-500 text-black py-0.5 px-1 font-bold text-xs rounded"
            >
              Upcoming
            </p>
          </div>
          <div class="p-4 space-y-2">
            <h2 class="font-bold text-xl">TALIS</h2>
            <h4 class="text-xs uppercase text-gray-500">Tokens Offered</h4>
            <p class="text-xl">123,123 TALIS</p>
            <h4 class="text-xs uppercase text-gray-500">Starting Bid Price</h4>
            <p class="text-xl">1.00 USDT</p>
          </div>
        </div>
      </NuxtLink>

      <p class="text-gray-400 uppercase">Auction opens in</p>
      <p class="text-4xl font-bold">{{ timeFormatted }}</p>
    </div>
  </div>
</template>
