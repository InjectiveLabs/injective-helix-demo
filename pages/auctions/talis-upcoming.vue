<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { parseISO, intervalToDuration } from 'date-fns'

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

const nowDate = ref(Date.now())
const eventDate = parseISO('2023-08-15')
const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  spotStore.cancelSubaccountStream()

  accountStore.$patch({ subaccountId: walletStore.defaultSubaccountId })
  spotStore.fetchSubaccountOrders([market.value?.marketId || ''])
  spotStore.fetchSubaccountOrderHistory()
  spotStore.streamSubaccountOrders(market.value?.marketId || '')
  spotStore.streamSubaccountOrderHistory(market.value?.marketId || '')
})

const market = computed(() =>
  spotStore.markets.find((m) => m.marketId === TALIS_MARKET_ID)
)

const timeFormatted = computed(() => {
  const { days, hours, minutes, seconds } = intervalToDuration({
    start: new Date(nowDate.value).getTime(),
    end: eventDate.getTime()
  })

  return `${days}D ${hours}H ${minutes}M ${seconds}S`
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

useIntervalFn(() => {
  nowDate.value = Date.now()
}, 1000)
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
      <PartialsAuctionsUpcomingHeader />

      <div class="flex space-x-4 py-4 md:py-8">
        <NuxtLink to="/auctions/talis-upcoming?showAuctions=true">
          Project Details
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div class="bg-gray-800 rounded-2xl p-8">
          <div>
            <h3 class="text-3xl font-semibold mb-8">Project details</h3>

            <p>
              Talis is a NFT marketplace that empowers artists and bridges
              physical & digital art on the Injective. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Aliquam et velit odio. Integer
              nisl arcu, vulputate vel gravida vitae, rutrum nec enim. Nunc sit
              amet est in enim malesuada lobortis id ut metus. Cras ut ex ac
              orci sollicitudin facilisis. Integer vehicula mollis vulputate.
            </p>

            <div class="py-4 flex flex-wrap gap-2">
              <span
                class="bg-blue-800 text-blue-500 px-2 py-0.5 rounded-md font-semibold text-sm"
              >
                WEBSITE
              </span>
              <span
                class="bg-blue-800 text-blue-500 px-2 py-0.5 rounded-md font-semibold text-sm"
              >
                WEBSITE
              </span>
              <span
                class="bg-blue-800 text-blue-500 px-2 py-0.5 rounded-md font-semibold text-sm"
              >
                WEBSITE
              </span>
              <span
                class="bg-blue-800 text-blue-500 px-2 py-0.5 rounded-md font-semibold text-sm"
              >
                WEBSITE
              </span>
            </div>

            <div>
              <h3 class="text-gray-400 font-semibold py-4">AUCTION INFO</h3>

              <div
                class="flex justify-between items-center py-4 border-y border-y-gray-600"
              >
                <p>Tokens Offered</p>
                <p>100,000 TALIS</p>
              </div>

              <div
                class="flex justify-between items-center py-4 border-y border-y-gray-600"
              >
                <p>Starting bid price</p>
                <p>1.00 $</p>
              </div>

              <div
                class="flex justify-between items-center py-4 border-y border-y-gray-600"
              >
                <p>Auction starts</p>
                <p>Aug 5, 2023 10:00 UTC</p>
              </div>

              <div
                class="flex justify-between items-center py-4 border-y border-y-gray-600"
              >
                <p>Auction ends</p>
                <p>Aug 6, 2023 10:00 UTC</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="bg-gray-800 rounded-2xl p-8 relative">
            <PartialsAuctionsForm v-bind="{ market }" />

            <div
              class="absolute inset-0 backdrop-blur grid place-items-center text-xl"
            >
              <div class="text-center">
                <h4 class="text-md font-semibold">Auctions Starts In</h4>
                <h3 class="text-xl font-bold">{{ timeFormatted }}</h3>
              </div>
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
