<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import {
  getNewMarketSlugFromWHDenom,
  getNewMarketTickerFromWHDenom
} from '@/app/utils/market'
import { legacyWHDenoms } from '@/app/data/token'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '@/app/utils/constants'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import {
  Modal,
  UiSpotMarket,
  TradingBotsSubPage,
  UiMarketWithToken
} from '@/types'

definePageMeta({
  middleware: ['grid-strategy-subaccount']
})

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const filterByCurrentMarket = ref(false)
const isWelcomeBannerViewed = ref(false)
const status = reactive(new Status(StatusType.Loading))

const market = computed(() => gridStrategyStore.spotMarket)

const legacyWHMarketDenom = computed(() =>
  legacyWHDenoms.find((denom) => denom === (market.value?.baseDenom || ''))
)

function onLoad(pageMarket: UiMarketWithToken) {
  Promise.all([
    spotStore.streamTrades(pageMarket.marketId),
    spotStore.streamOrderbookUpdate(pageMarket.marketId)
  ]).catch($onError)

  gridStrategyStore.$patch({
    spotMarket: pageMarket as UiSpotMarket
  })

  fetchData({
    subaccountId: walletStore.isUserWalletConnected
      ? addressAndMarketSlugToSubaccountId(walletStore.address, pageMarket.slug)
      : undefined,
    market: pageMarket
  })
}

function fetchData({
  subaccountId,
  market
}: {
  subaccountId?: string
  market: UiMarketWithToken
}) {
  status.setLoading()

  Promise.all([
    authZStore.fetchGrants(),
    accountStore.streamBankBalance(),
    gridStrategyStore.fetchAllStrategies(),
    exchangeStore.fetchMarketHistory({
      marketIds: [market.marketId],
      resolution: MARKETS_HISTORY_CHART_ONE_HOUR * 24,
      countback: 30
    }),
    accountStore.fetchAccountPortfolioBalances(),
    accountStore.streamSubaccountBalance(subaccountId)
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()

      if (
        gridStrategyStore.strategies.length === 0 &&
        !isWelcomeBannerViewed.value
      ) {
        modalStore.openModal(Modal.SgtBanner)
        isWelcomeBannerViewed.value = true
      }
    })
}

onUnmounted(() => {
  spotStore.reset()
})
</script>

<template>
  <PartialsTradingLayout is-spot is-grid @loaded="onLoad">
    <template #trading-form>
      <AppHocLoading v-bind="{ status }">
        <PartialsGridStrategySpotForm v-if="market" :market="market" />
      </AppHocLoading>
    </template>

    <template #orders>
      <PartialsGridStrategySpotStrategies
        v-if="market"
        v-model:filterByCurrentMarket="filterByCurrentMarket"
        v-bind="{
          market,
          status
        }"
      />
    </template>

    <template #modals>
      <ModalsLiquiditySgtBanner />
    </template>
  </PartialsTradingLayout>

  <PartialsLegacyWormholeBanner v-if="legacyWHMarketDenom">
    <template #default>
      <div class="inline-block lg:space-x-2">
        <span>
          {{ $t('common.legacy.spotGridIsMigrating') }}
        </span>

        <span>
          <PartialsLegacyWormholeButton
            v-bind="{
              to: {
                name: TradingBotsSubPage.GridSpotMarket,
                params: {
                  market: getNewMarketSlugFromWHDenom(legacyWHMarketDenom)
                }
              }
            }"
          >
            <div class="flex justify-center items-center">
              <span>
                {{
                  $t('common.legacy.goToNewSGT', {
                    market: getNewMarketTickerFromWHDenom(
                      legacyWHMarketDenom || ''
                    )
                  })
                }}
              </span>

              <SharedIcon
                name="arrow"
                class="ml-1 w-3 h-3 min-w-3 rotate-180"
              />
            </div>
          </PartialsLegacyWormholeButton>
        </span>
      </div>
    </template>

    <template #add-on>
      <PartialsLegacyWormholeLearnMore />
    </template>
  </PartialsLegacyWormholeBanner>
</template>
