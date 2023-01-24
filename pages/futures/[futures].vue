<script lang="ts" setup>
import {
  MarketType,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Modal, UiMarketWithToken } from '@/types'

const derivativeStore = useDerivativeStore()
const modalStore = useModalStore()
const { $onError } = useNuxtApp()

const market = ref<UiDerivativeMarketWithToken | undefined>(undefined)
const marketIsExpired = ref(false)

function onLoad(pageMarket: UiMarketWithToken) {
  Promise.all([
    derivativeStore.initMarketStreams(
      pageMarket as UiDerivativeMarketWithToken
    ),
    derivativeStore.getMarketMarkPrice(
      pageMarket as UiDerivativeMarketWithToken
    )
  ]).catch($onError)

  market.value = pageMarket as UiDerivativeMarketWithToken
  checkMarketIsExpired(pageMarket as UiDerivativeMarketWithToken)
}

function checkMarketIsExpired(market: UiDerivativeMarketWithToken) {
  if (market.subType !== MarketType.Futures) {
    return false
  }

  const expiryFuturesMarket = market as UiExpiryFuturesMarketWithToken

  if (!expiryFuturesMarket.expiryFuturesMarketInfo) {
    return false
  }

  marketIsExpired.value =
    expiryFuturesMarket.expiryFuturesMarketInfo.expirationTimestamp <=
    Date.now() / 1000

  if (marketIsExpired) {
    modalStore.openModal({ type: Modal.MarketExpired })
  }
}
</script>

<template>
  <PartialsTradingLayout @loaded="onLoad">
    <template #trading-form>
      <PartialsTradingDerivativesTradingForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsTradingDerivativesOrders v-if="market" :market="market" />
    </template>

    <template #modals>
      <div>
        <ModalsAddMargin />
        <ModalsMarketExpired
          v-if="market && marketIsExpired"
          :market="market"
        />
      </div>
    </template>
  </PartialsTradingLayout>
</template>
