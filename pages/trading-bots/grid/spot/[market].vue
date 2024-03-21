<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '@/app/utils/constants'
import { legacyWHDenoms } from '@/app/data/token'
import { getNewMarketSlugFromWHDenom } from '@/app/utils/market'
import { Modal, TradingBotsSubPage, UiMarketWithToken } from '@/types'

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
    spotMarket: pageMarket as UiSpotMarketWithToken
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
    exchangeStore.getMarketsHistory({
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

  <CommonLegacyWormholeBanner v-if="legacyWHMarketDenom">
    <template #default>
      <div class="inline-block lg:space-x-2">
        <span>
          {{ $t('common.legacy.marketIsMigrating') }}
        </span>

        <span>
          <CommonLegacyWormholeButton
            v-bind="{
              denom: legacyWHMarketDenom,
              to: {
                name: TradingBotsSubPage.GridSpotMarket,
                params: {
                  market: getNewMarketSlugFromWHDenom(legacyWHMarketDenom)
                }
              }
            }"
          />
        </span>
      </div>
    </template>

    <template #add-on>
      <CommonLegacyWormholeLearnMore />
    </template>
  </CommonLegacyWormholeBanner>
</template>
