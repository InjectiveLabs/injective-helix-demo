<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { betaMarketSlugs } from '@/app/data/market'
import {
  getDefaultSpotMarketRouteParams,
  getDefaultPerpetualMarketRouteParams
} from '@/app/utils/market'
import {
  Modal,
  TradingLayout,
  UiMarketWithToken,
  UiMarketSummary
} from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { params } = useRoute()
const { $onError } = useNuxtApp()

const props = defineProps({
  isSpot: Boolean,

  hardcodedSlug: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits<{
  (e: 'loaded', state: UiMarketWithToken): void
}>()

const slug = props.hardcodedSlug || (Object.values(params)[0] as string) || ''

const showMarketList = ref(false)
const status = reactive(new Status(StatusType.Loading))
const fetchStatus = reactive(new Status(StatusType.Loading))
const market = ref<UiMarketWithToken | undefined>(undefined)

const marketIsBeta = computed(() => betaMarketSlugs.includes(slug))

onMounted(() => {
  Promise.all([
    exchangeStore.fetchTradingRewardsCampaign(),
    exchangeStore.fetchFeeDiscountAccountInfo(),
    ...[props.isSpot ? spotStore.init() : derivativeStore.init()]
  ])
    .then(() => {
      if (betaMarketSlugs.includes(slug)) {
        modalStore.openModal({ type: Modal.MarketBeta })
      }

      const marketBySlug = getMarketBySlug()

      if (!marketBySlug) {
        const defaultRoute = props.isSpot
          ? getDefaultSpotMarketRouteParams()
          : getDefaultPerpetualMarketRouteParams()

        router.push(defaultRoute)
      } else {
        market.value = marketBySlug

        emit('loaded', marketBySlug as UiMarketWithToken)
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
      fetchStatus.setIdle()
    })
})

onUnmounted(() => (props.isSpot ? spotStore.reset() : derivativeStore.reset()))

onWalletConnected(() => {
  if (market.value) {
    emit('loaded', market.value)
  }
})

const summary = computed(() => {
  const marketSummaries: UiMarketSummary[] = props.isSpot
    ? spotStore.marketsSummary
    : derivativeStore.marketsSummary

  return marketSummaries.find(
    (m) => m.marketId === (market.value as UiMarketWithToken).marketId
  )
})

function getMarketBySlug() {
  const markets: UiMarketWithToken[] = props.isSpot
    ? spotStore.markets
    : derivativeStore.markets

  return markets.find((m) => m.slug.toLowerCase() === slug.toLowerCase())
}

function close() {
  showMarketList.value = false
}

function toggleMarketList() {
  showMarketList.value = !showMarketList.value
}

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected: boolean) => {
    if (!isConnected) {
      fetchStatus.setLoading()
    }
  }
)
</script>

<template>
  <AppHocLoading :key="route.fullPath" :status="status" class="h-full">
    <div v-if="market && summary" class="min-h-lg h-full-flex">
      <div class="w-full px-1 h-market-info flex-none">
        <PartialsTradingMarketStats
          v-bind="{
            summary,
            market: market,
            expanded: showMarketList
          }"
          @marketsList:toggle="toggleMarketList"
        />
      </div>

      <div class="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-1 p-1 h-full">
        <div
          class="col-span-6 lg:col-span-3 4xl:col-span-3"
          data-cy="trading-side-component"
        >
          <div
            key="market-trading-panel"
            class="flex-col flex-wrap h-full w-full hidden lg:flex space-y-1"
          >
            <CommonCard no-padding>
              <div
                v-if="
                  fetchStatus.isIdle() &&
                  walletStore.isUserWalletConnected &&
                  !accountStore.hasEnoughInjForGas
                "
                class="bg-gray-1000 rounded-lg mb-1 p-6"
              >
                <CommonInsufficientGasInner />
              </div>
              <PartialsTradingBalances v-else :market="market" />
            </CommonCard>
            <CommonCard no-padding class="px-6 py-4 rounded-xl relative grow">
              <div
                :class="{
                  invisible: showMarketList
                }"
              >
                <slot name="trading-form" />
              </div>
            </CommonCard>
          </div>
        </div>

        <div
          class="col-span-6 lg:col-span-9 4xl:col-span-9 max-h-screen-excluding-header-and-market-info"
          :class="{
            '-order-1': appStore.userState.tradingLayout === TradingLayout.Right
          }"
        >
          <div class="h-full-flex">
            <div class="w-full flex-none">
              <CommonCard tight class="relative">
                <div class="grid grid-cols-6 lg:grid-cols-12">
                  <div class="col-span-6 lg:col-span-4 4xl:col-span-3 z-30">
                    <PartialsTradingMarket :market="market" />
                  </div>
                  <div
                    class="col-span-6 lg:col-span-8 4xl:col-span-9"
                    :class="{
                      '-order-1':
                        appStore.userState.tradingLayout === TradingLayout.Right
                    }"
                  >
                    <PartialsTradingMarketChart
                      :market="market"
                      class="hidden lg:block"
                    />
                  </div>
                </div>
              </CommonCard>

              <div class="w-full lg:hidden mt-2">
                <slot name="trading-panel" />
                <PartialsTradingBalances :market="market" />
                <CommonCard class="mt-1">
                  <div class="px-6 pt-2">
                    <slot name="trading-form" />
                  </div>
                </CommonCard>
              </div>
            </div>

            <slot name="orders" />
          </div>
        </div>
      </div>

      <div
        class="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-1 p-1 z-[50] lg:z-[20] absolute w-full h-screen-excluding-header-and-market-info top-market-info pointer-events-none"
      >
        <PartialsTradingSidebar
          v-show="showMarketList"
          key="market-selection"
          :market="market"
          @close="close"
        />
      </div>

      <slot name="modals" />
      <ModalsMarketBeta v-if="marketIsBeta" />
    </div>
  </AppHocLoading>

  <PartialsAccountBridge />
</template>
