<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { intervalToDuration } from 'date-fns'
import { AUCTIONS } from '@/app/data/market'

const route = useRoute()
const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const auctionStore = useAuctionStore()

const now = ref(Date.now())
const status = reactive(new Status(StatusType.Loading))

const market = computed(
  () =>
    auctionStore.markets.find(
      (m) => m.slug === (route.params.auction as string)
    )!
)

const auction = computed(
  () => AUCTIONS.find((auction) => auction.marketId === market.value.marketId)!
)

const isLive = computed(
  () =>
    auction.value.auctionStarts.getTime() < now.value &&
    auction.value.auctionCloses.getTime() > now.value
)

const timeFormatted = computed(() => {
  const { days, hours, minutes, seconds } = intervalToDuration({
    start: new Date(now.value).getTime(),
    end: auction.value.auctionCloses.getTime()
  })

  return `${days}D ${hours}H ${minutes}M ${seconds}S`
})

onWalletConnected(() => {
  spotStore.cancelSubaccountStream()
  loadSubaccountDetails()
})

onMounted(() => {
  status.setLoading()

  Promise.all([
    spotStore.fetchOrderbook(market.value?.marketId || ''),
    spotStore.streamOrderbookUpdate(market.value?.marketId || ''),
    loadSubaccountDetails()
  ])
    .then(() => {
      //
    })
    .finally(() => {
      status.setIdle()
    })
})

function loadSubaccountDetails() {
  if (market.value && walletStore.isUserWalletConnected) {
    accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
    spotStore.fetchSubaccountOrders([market.value.marketId])
    spotStore.fetchSubaccountOrderHistory()
    spotStore.streamSubaccountOrders(market.value.marketId)
    spotStore.streamSubaccountOrderHistory(market.value.marketId)
  }
}

useIntervalFn(() => {
  loadSubaccountDetails()
}, 5000)

useIntervalFn(() => {
  now.value = Date.now()
}, 1000)
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 min-h-screen pb-20">
    <div>
      <NuxtLink
        :to="`/auctions`"
        class="flex items-center text-2xl space-x-4 py-4 hover:text-blue-400 transition-colors duration-300"
      >
        <BaseIcon name="chevron" />
        <span>Back to All Auctions</span>
      </NuxtLink>
    </div>

    <AppHocLoading v-bind="{ status }">
      <PartialsAuctionsHeader v-bind="{ auction, isLive }" />

      <div
        class="md:flex space-y-4 md:space-y-0 justify-between items-center py-4 md:py-8"
      >
        <div class="space-x-4">
          <NuxtLink :to="`/auctions/${market.slug}`">Project Details</NuxtLink>

          <NuxtLink
            v-if="walletStore.isUserWalletConnected && isLive"
            :to="`/auctions/${market.slug}/bids/`"
          >
            My Bids
          </NuxtLink>
        </div>

        <div v-if="isLive" class="flex space-x-4 justify-between items-center">
          <span class="uppercase text-gray-400 text-sm">Auction Closes</span>
          <div
            class="bg-green-500 text-black py-2 px-4 rounded-md font-semibold w-40 text-center"
          >
            {{ timeFormatted }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div class="bg-gray-800 rounded-2xl p-8">
          <NuxtPage v-bind="{ market, auction, isLive }" />
        </div>

        <div>
          <div class="bg-gray-800 rounded-2xl p-8 relative">
            <PartialsAuctionsForm v-bind="{ market }" />

            <div
              v-if="!walletStore.isUserWalletConnected"
              class="absolute inset-0 backdrop-blur grid place-items-center"
            >
              <h1 class="text-md font-semibold">Connect Wallet To Bid</h1>
            </div>

            <div
              v-if="!isLive"
              class="absolute inset-0 backdrop-blur grid place-items-center text-xl"
            >
              <PartialsAuctionsUpcomingTime />
            </div>
          </div>
        </div>

        <div v-if="isLive" class="bg-gray-800 rounded-2xl p-8">
          <PartialsAuctionsBids v-bind="{ market }" />
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
