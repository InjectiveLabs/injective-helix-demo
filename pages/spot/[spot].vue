<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { notLiquidMarkets } from '@/app/data/market'
import { legacyWHDenoms } from '@/app/data/token'
import { getNewMarketSlugFromWHDenom } from '@/app/utils/market'
// import {
//   SpotTradeIntegrityStrategy,
//   SpotOrderbookIntegrityStrategy,
//   SpotSubaccountOrderIntegrityStrategy,
//   SpotSubaccountTradeIntegrityStrategy
// } from '@/app/client/streams/data-integrity/strategies'

import { ActivityFetchOptions, UiMarketWithToken, TradeSubPage } from '@/types'

definePageMeta({
  middleware: ['grid-strategy-subaccount']
})

const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()

const { $onError } = useNuxtApp()

const filterByCurrentMarket = ref(false)
const market = ref<UiSpotMarketWithToken | undefined>(undefined)
const fetchStatus = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  filterByCurrentMarket.value = false
  refreshSubaccountDetails()
})

const notLiquidMarket = computed(() =>
  notLiquidMarkets.find((m) => m.slug === market.value?.slug)
)

const isMarketIdInQuery = computed(() => !!useQueryRef('marketId', '').value)

const legacyWHMarketDenom = computed(() =>
  legacyWHDenoms.find((denom) => denom === (market.value?.baseDenom || ''))
)

const legacyWHBankAssets = computed(() =>
  accountStore.bankBalances
    .filter(
      ({ denom, amount }) =>
        new BigNumberInBase(amount).gt(0) && legacyWHMarketDenom.value === denom
    )
    .map(({ denom }) => denom)
)

const legacyWHSubaccountAssets = computed(() =>
  Object.values(accountStore.subaccountBalancesMap)
    .flat()
    .filter(
      ({ denom, totalBalance }) =>
        new BigNumberInBase(totalBalance).gt(0) &&
        legacyWHMarketDenom.value === denom
    )
    .map(({ denom }) => denom)
)

function onLoad(pageMarket: UiMarketWithToken) {
  filterByCurrentMarket.value = false

  Promise.all([
    spotStore.streamTrades(pageMarket.marketId),
    spotStore.streamOrderbookUpdate(pageMarket.marketId),
    tokenStore.fetchTokensUsdPriceMap([pageMarket.quoteToken.coinGeckoId])
  ]).catch($onError)

  market.value = pageMarket as UiSpotMarketWithToken
  refreshSubaccountDetails()
}

function refreshSubaccountDetails() {
  if (!market.value) {
    return
  }

  spotStore.cancelSubaccountStream()

  const fetchOptions = filterByCurrentMarket.value
    ? {
        filters: {
          marketIds: [market.value.marketId]
        }
      }
    : undefined
  const marketId = filterByCurrentMarket.value
    ? market.value.marketId
    : undefined

  fetchSubaccountOrderDetails(fetchOptions)
  streamSubaccountOrderDetails(marketId)
}

function fetchSubaccountOrderDetails(fetchOptions?: ActivityFetchOptions) {
  fetchStatus.setLoading()

  const marketIds = fetchOptions?.filters?.marketIds

  Promise.all([
    spotStore.fetchSubaccountOrders(marketIds),
    spotStore.fetchSubaccountOrderHistory(fetchOptions),
    spotStore.fetchSubaccountTrades(fetchOptions)
  ])
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
}

function streamSubaccountOrderDetails(marketId?: string) {
  Promise.all([
    spotStore.streamSubaccountTrades(marketId),
    spotStore.streamSubaccountOrders(marketId),
    spotStore.streamSubaccountOrderHistory(marketId)
  ])
}

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected: Boolean) => {
    if (isConnected) {
      fetchStatus.setLoading()
    }
  }
)

watch(
  () => accountStore.subaccountId,
  () => {
    refreshSubaccountDetails()
  }
)

useIntervalFn(() => {
  if (!market.value) {
    return
  }

  // const args = filterByCurrentMarket.value ? [market.value.marketId] : undefined

  Promise.all([
    // SpotSubaccountOrderIntegrityStrategy.make(args).validate(),
    // SpotSubaccountTradeIntegrityStrategy.make(args).validate(),
    // SpotTradeIntegrityStrategy.make(market.value.marketId).validate(),
    // SpotOrderbookIntegrityStrategy.make(market.value.marketId).validate(),
    tokenStore.fetchTokensUsdPriceMap([market.value.quoteToken.coinGeckoId])
  ])
}, 30 * 1000)
</script>

<template>
  <PartialsTradingLayout is-spot @loaded="onLoad">
    <template #trading-form>
      <PartialsTradingSpotTradingForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsTradingSpotOrders
        v-if="market"
        v-model:filterByCurrentMarket="filterByCurrentMarket"
        :market="market"
        :status="fetchStatus"
        @update:filter-by-current-market="refreshSubaccountDetails"
      />
    </template>

    <template #modals>
      <ModalsMarketNotLiquid
        v-if="notLiquidMarket"
        v-bind="{ notLiquidMarket }"
      />
      <ModalsMarketNotOnHelix
        v-if="
          isMarketIdInQuery &&
          !appStore.userState.preferences.skipExperimentalCOnfirmationModal
        "
      />
      <ModalsMarketRestricted
        v-if="market"
        :key="market.marketId"
        v-bind="{
          market,
          isSpot: true
        }"
      />
    </template>
  </PartialsTradingLayout>

  <PartialsLegacyWormholeBanner
    v-if="
      legacyWHMarketDenom &&
      (legacyWHBankAssets.length > 0 || legacyWHSubaccountAssets.length > 0)
    "
  >
    <template #default>
      <div class="inline-block lg:space-x-2">
        <span>
          {{ $t('common.legacy.marketIsMigrating') }}
        </span>

        <span>
          <PartialsLegacyWormholeButton
            v-bind="{
              denom: legacyWHMarketDenom,
              to: {
                name: TradeSubPage.Spot,
                params: {
                  spot: getNewMarketSlugFromWHDenom(legacyWHMarketDenom)
                }
              }
            }"
          />
        </span>
      </div>
    </template>

    <template #add-on>
      <PartialsLegacyWormholeLearnMore />
    </template>
  </PartialsLegacyWormholeBanner>
</template>
