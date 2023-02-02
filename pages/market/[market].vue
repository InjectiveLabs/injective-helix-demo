<script lang="ts" setup>
import { Modal, UiMarketWithToken } from '@/types'
import { deprecatedMarkets, upcomingMarkets } from '@/app/data/market'

const modalStore = useModalStore()
const route = useRoute()

const routeParamMarket = route.params.market

const marketIsNew = upcomingMarkets.some(
  ({ slug }) => slug === routeParamMarket
)

const deprecatedMarket = deprecatedMarkets.find(
  (m) => m.slug === routeParamMarket
)

const market = ref<UiMarketWithToken | undefined>(undefined)

function onLoad() {
  if (marketIsNew) {
    modalStore.openModal({ type: Modal.MarketNew })
  } else if (deprecatedMarket) {
    modalStore.openModal({ type: Modal.MarketDeprecated })
  }
}

onLoad()
</script>

<template>
  <PartialsTradingLayout hardcoded-slug="btc-usdt-perp" @loaded="onLoad">
    <template #trading-panel>
      <PartialsCommonBalances v-if="market" :market="market" />
      <PartialsCommonTrading class="mt-1 flex-1" :market="market" />
    </template>

    <template #chart>
      <PartialsTradingMarketStatsChart
        v-if="market"
        :market="market"
        class="hidden lg:block"
      />
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
