<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

// const TALIS_MARKET_ID =
//   '0xe5fcbb5a2935d0b1ce700c841343cd86803ca04f43ca6a03f0c714ec27550cd2'
// const TALIS_SLUG = 'unknown-usdt'

const TALIS_MARKET_ID =
  '0x491ee4fae7956dd72b6a97805046ffef65892e1d3254c559c18056a519b2ca15'

const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find((m) => m.marketId === TALIS_MARKET_ID)
)

onMounted(() => {
  status.setLoading()

  spotStore
    .init()
    .then(() => {
      Promise.all([
        spotStore.fetchOrderbook(TALIS_MARKET_ID),
        spotStore.streamOrderbookUpdate(TALIS_MARKET_ID)
      ]).then(() => {
        status.setIdle()
      })
    })
    .catch($onError)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 min-h-screen pb-20">
    <div>
      <NuxtLink
        to="/auctions"
        class="flex items-center text-2xl space-x-4 py-4 hover:text-blue-400 transition-colors duration-300"
      >
        <BaseIcon name="chevron" />
        <span>Back to All Auctions</span>
      </NuxtLink>
    </div>

    <AppHocLoading v-bind="{ status }">
      <PartialsAuctionsHeader />

      <div class="flex space-x-4 py-4 md:py-8">
        <NuxtLink to="/auctions/talis">Project Details</NuxtLink>
        <NuxtLink to="/auctions/talis/bid">My Bid</NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div class="bg-gray-800 rounded-2xl p-8">
          <NuxtPage />
        </div>

        <div class="bg-gray-800 rounded-2xl p-8">
          <PartialsAuctionsForm v-bind="{ market }" />
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>

<style scoped>
a {
  @apply text-xl transition-colors duration-300;
}
a.router-link-exact-active {
  @apply text-blue-500;
}
</style>
