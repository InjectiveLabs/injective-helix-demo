<script lang="ts" setup>
import { SharedUiDerivativeMarket } from '@shared/types'
import { getDefaultFuturesMarket } from '@/app/utils/market'
import { deprecatedMarkets, upcomingMarkets } from '@/app/data/market'
import { Modal, UiMarketWithToken } from '@/types'

const modalStore = useModalStore()
const route = useRoute()

const routeParamMarket = route.params.market

const marketIsNew = upcomingMarkets.some(
  ({ slug }) => slug === routeParamMarket
)

const deprecatedMarket = deprecatedMarkets.find(
  (m) => m.slug === routeParamMarket
)

const market = ref<SharedUiDerivativeMarket | undefined>(undefined)

function onLoad(pageMarket: UiMarketWithToken) {
  market.value = pageMarket as SharedUiDerivativeMarket

  if (marketIsNew) {
    modalStore.openModal(Modal.MarketNew)
  } else if (deprecatedMarket) {
    modalStore.openModal(Modal.MarketDeprecated)
  }
}
</script>

<template>
  <PartialsTradingLayout
    :hardcoded-slug="getDefaultFuturesMarket()"
    @loaded="onLoad"
  >
    <template #trading-form>
      <PartialsTradingDerivativesTradingForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsTradingDerivativeOrders v-if="market" :market="market" />
    </template>

    <template #modals>
      <div>
        <ModalsMarketNew v-if="marketIsNew" />
        <ModalsMarketDeprecated
          v-if="deprecatedMarket"
          :market="deprecatedMarket"
        />
      </div>
    </template>
  </PartialsTradingLayout>
</template>
