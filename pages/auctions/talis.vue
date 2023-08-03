<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: [
    (to) => {
      if (!(to.query.showAuctions === 'true')) {
        return navigateTo('/')
      }
    }
  ]
})

const TALIS_MARKET_ID =
  '0xe5fcbb5a2935d0b1ce700c841343cd86803ca04f43ca6a03f0c714ec27550cd2'

const route = useRoute()
const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()

const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find((m) => m.marketId === TALIS_MARKET_ID)
)

onWalletConnected(() => {
  spotStore.cancelSubaccountStream()

  accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
  spotStore.fetchSubaccountOrders([market.value?.marketId || ''])
  spotStore.fetchSubaccountOrderHistory()
  spotStore.streamSubaccountOrders(market.value?.marketId || '')
  spotStore.streamSubaccountOrderHistory(market.value?.marketId || '')
})

onMounted(() => {
  status.setLoading()

  spotStore
    .init()
    .then(() => {
      Promise.all([
        spotStore.fetchOrderbook(TALIS_MARKET_ID),
        spotStore.streamOrderbookUpdate(TALIS_MARKET_ID)
      ]).then(() => {
        if (walletStore.isUserWalletConnected) {
          accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
          spotStore.fetchSubaccountOrders([market.value?.marketId || ''])
          spotStore.fetchSubaccountOrderHistory()
          spotStore.streamSubaccountOrders(market.value?.marketId || '')
          spotStore.streamSubaccountOrderHistory(market.value?.marketId || '')
        }
        status.setIdle()
      })
    })
    .catch($onError)
})

onUnmounted(() => {
  spotStore.cancelOrderbookUpdateStream()
  spotStore.cancelSubaccountStream()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 min-h-screen pb-20">
    <div>
      <NuxtLink
        to="/auctions?showAuctions=true"
        class="flex items-center text-2xl space-x-4 py-4 hover:text-blue-400 transition-colors duration-300"
      >
        <BaseIcon name="chevron" />
        <span>Back to All Auctions</span>
      </NuxtLink>
    </div>

    <AppHocLoading v-bind="{ status }">
      <PartialsAuctionsHeader />

      <div class="flex space-x-4 py-4 md:py-8">
        <NuxtLink to="/auctions/talis?showAuctions=true">
          Project Details
        </NuxtLink>

        <NuxtLink
          :class="{ 'text-gray-500': !walletStore.isUserWalletConnected }"
          :to="
            walletStore.isUserWalletConnected
              ? '/auctions/talis/bid?showAuctions=true'
              : undefined
          "
        >
          My Bid
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
          </div>
        </div>

        <div
          v-if="route.name === 'auctions-talis'"
          class="bg-gray-800 rounded-2xl p-8"
        >
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
