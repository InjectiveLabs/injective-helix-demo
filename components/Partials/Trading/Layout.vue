<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { breakpointsTailwind } from '@vueuse/core'
import { betaMarketSlugs } from '@/app/data/market'
import {
  getDefaultSpotMarketRouteParams,
  getDefaultPerpetualMarketRouteParams,
  getDefaultGridSpotMarketRouteParams
} from '@/app/utils/market'
import {
  Modal,
  TradingLayout,
  UiMarketWithToken,
  UiMarketSummary
} from '@/types'
import { spotGridMarkets } from '@/app/data/grid-strategy'

const router = useRouter()
const appStore = useAppStore()
const spotStore = useSpotStore()
const modalStore = useModalStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { params, query } = useRoute()
const { $onError } = useNuxtApp()
const { lg: isDesktop } = useBreakpoints(breakpointsTailwind)

const props = defineProps({
  isSpot: Boolean,
  isGrid: Boolean,

  hardcodedSlug: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits<{
  loaded: [state: UiMarketWithToken]
}>()

const slug = props.hardcodedSlug || (Object.values(params)[0] as string) || ''
const queryMarketId = (query.marketId as string) || ''

const showMarketList = ref(false)
const status = reactive(new Status(StatusType.Loading))
const market = ref<UiMarketWithToken | undefined>(undefined)

const marketIsBeta = computed(() => betaMarketSlugs.includes(slug))

const summary = computed(() => {
  const marketSummaries: UiMarketSummary[] = props.isSpot
    ? spotStore.marketsSummary
    : derivativeStore.marketsSummary

  return marketSummaries.find(
    (m) => m.marketId === (market.value as UiMarketWithToken).marketId
  )
})

const userTradingLayout = computed(
  () => appStore.userState.preferences.tradingLayout
)

onMounted(() => {
  init()
})

onUnmounted(() => (props.isSpot ? spotStore.reset() : derivativeStore.reset()))

onWalletConnected(() => {
  if (market.value) {
    emit('loaded', market.value)
  }
})

function init() {
  Promise.all([
    exchangeStore.fetchTradingRewardsCampaign(),
    exchangeStore.fetchFeeDiscountAccountInfo(),
    ...[
      props.isSpot
        ? spotStore.initFromTradingPage([queryMarketId])
        : derivativeStore.initFromTradingPage([queryMarketId])
    ]
  ])
    .then(() => {
      if (betaMarketSlugs.includes(slug)) {
        modalStore.openModal(Modal.MarketBeta)
      }

      if (props.isGrid && props.isSpot) {
        const gridMarket = spotGridMarkets.find(
          (market) => market.slug.toLowerCase() === slug.toLowerCase()
        )

        if (!gridMarket) {
          router.push(getDefaultGridSpotMarketRouteParams())
        }
      }

      const marketBySlugOrMarketId = getMarketBySlugOrMarketId()

      if (!marketBySlugOrMarketId) {
        const defaultRoute = props.isSpot
          ? getDefaultSpotMarketRouteParams()
          : getDefaultPerpetualMarketRouteParams()

        router.push(defaultRoute)
      } else {
        market.value = marketBySlugOrMarketId

        emit('loaded', marketBySlugOrMarketId as UiMarketWithToken)
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function getMarketBySlugOrMarketId() {
  const markets: UiMarketWithToken[] = props.isSpot
    ? spotStore.markets
    : derivativeStore.markets

  return markets.find(
    (m) =>
      m.slug.toLowerCase() === slug.toLowerCase() ||
      m.marketId === queryMarketId
  )
}

function onCloseMarketList() {
  showMarketList.value = false
}

function onToggleMarketList() {
  showMarketList.value = !showMarketList.value
}
</script>

<template>
  <AppHocLoading :status="status" class="h-full">
    <div v-if="market && summary" class="min-h-lg h-full-flex">
      <div class="w-full px-1 h-market-info flex-none">
        <PartialsTradingMarketStats
          v-bind="{
            isGrid,
            summary,
            market: market,
            expanded: showMarketList
          }"
          @marketsList:toggle="onToggleMarketList"
        />
      </div>

      <div class="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-1 p-1 h-full">
        <div
          class="col-span-6 lg:col-span-3 4xl:col-span-3"
          data-cy="trading-side-component"
        >
          <div
            v-if="isDesktop"
            key="market-trading-panel"
            class="flex-col flex-wrap h-full w-full flex space-y-1"
          >
            <CommonCard v-if="!isGrid" is-no-padding>
              <PartialsTradingBalances :market="market" />
            </CommonCard>

            <CommonCard
              is-no-padding
              class="px-6 py-4 rounded-xl relative grow"
            >
              <div
                :class="{
                  invisible:
                    showMarketList && userTradingLayout !== TradingLayout.Right
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
            '-order-1': userTradingLayout === TradingLayout.Right
          }"
        >
          <div class="h-full-flex">
            <div class="w-full flex-none">
              <CommonCard is-tight class="relative">
                <div class="grid grid-cols-6 lg:grid-cols-12">
                  <div class="col-span-6 lg:col-span-4 4xl:col-span-3 z-30">
                    <PartialsTradingMarket :market="market" />
                  </div>
                  <div
                    class="col-span-6 lg:col-span-8 4xl:col-span-9"
                    :class="{
                      '-order-1': userTradingLayout === TradingLayout.Right
                    }"
                  >
                    <CommonTradingChartWrapper
                      v-if="isDesktop"
                      v-bind="{ marketId: market.marketId }"
                    />
                  </div>
                </div>
              </CommonCard>

              <div v-if="!isDesktop" class="w-full mt-2">
                <slot name="trading-panel" />
                <PartialsTradingBalances v-if="!isGrid" :market="market" />
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
          v-bind="{
            isGrid,
            market
          }"
          @close="onCloseMarketList"
        />
      </div>

      <slot name="modals" />
      <ModalsMarketBeta v-if="marketIsBeta && !isGrid" />
    </div>
  </AppHocLoading>
</template>
