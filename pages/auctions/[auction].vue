<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MainPage, AuctionSubPage } from '@/types'

const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const auctionStore = useAuctionStore()
const route = useRoute()

const status = reactive(new Status(StatusType.Loading))
const isUpcoming = route.query.isUpcoming === 'true'

const market = computed(
  () =>
    auctionStore.markets.find(
      (m) => m.slug === (route.params.auction as string)
    )!
)

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
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 min-h-screen pb-20">
    <div>
      <NuxtLink
        :to="{
          name: MainPage.Auctions,
          query: { showActions: 'true' }
        }"
        class="flex items-center text-2xl space-x-4 py-4 hover:text-blue-400 transition-colors duration-300"
      >
        <BaseIcon name="chevron" />
        <span>Back to All Auctions</span>
      </NuxtLink>
    </div>

    <AppHocLoading v-bind="{ status }">
      <PartialsAuctionsHeader />

      <div class="flex space-x-4 py-4 md:py-8">
        <NuxtLink
          :to="{
            name: AuctionSubPage.Details,
            params: { auction: market.slug },
            query: { showActions: 'true', isUpcoming: `${!!isUpcoming}` }
          }"
        >
          Project Details
        </NuxtLink>

        <NuxtLink
          v-if="
            walletStore.isUserWalletConnected &&
            $route.query.isUpcoming === 'false'
          "
          :to="{
            name: AuctionSubPage.Bids,
            params: { auction: market.slug },
            query: { showActions: 'true', isUpcoming: `${!!isUpcoming}` }
          }"
        >
          My Bids
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div class="bg-gray-800 rounded-2xl p-8">
          <NuxtPage v-bind="{ market }" />
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
              v-if="isUpcoming"
              class="absolute inset-0 backdrop-blur grid place-items-center text-xl"
            >
              <PartialsAuctionsUpcomingTime />
            </div>
          </div>
        </div>

        <div v-if="!isUpcoming" class="bg-gray-800 rounded-2xl p-8">
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
