<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { BigNumber } from '@injectivelabs/utils'
import { MARKETS_INFO } from '@/app/data/marketInfo'
import { IsSpotKey, MarketKey } from '@/types'
import type { UiDerivativeMarket } from '@/types'

const isSpot = inject(IsSpotKey)
const market = inject(MarketKey)

const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const priceTickSize = computed(() => {
  if (!market || !market.value) {
    return ''
  }

  return BigNumber(10).pow(market.value.priceTensMultiplier).toFixed()
})

const quantityTickSize = computed(() => {
  if (!market || !market.value) {
    return ''
  }
  return BigNumber(10)
    .exponentiatedBy(market.value.quantityTensMultiplier)
    .toFixed()
})

const maxLeverage = computed(() => {
  if (!market || !market.value || isSpot) {
    return ''
  }

  return BigNumber(1)
    .dividedBy((market.value as UiDerivativeMarket).initialMarginRatio)
    .dp(0)
})

const description = computed(() => {
  if (!market || !market.value) {
    return ''
  }

  return MARKETS_INFO.find(
    (info) =>
      info.symbol.toLowerCase() === market.value?.baseToken.symbol.toLowerCase()
  )?.description
})

function onCopy() {
  if (!market?.value?.marketId) {
    return
  }

  copy(market.value.marketId).then(() =>
    notificationStore.success({
      title: t('toast.marketIdCopied')
    })
  )
}
</script>

<template>
  <div v-if="market" class="p-6 xl:p-8 overflow-y-auto">
    <div class="flex">
      <div class="flex items-center pr-3">
        <CommonTokenIcon v-bind="{ isLg: true, token: market.baseToken }" />
      </div>
      <div>
        <p class="font-bold">{{ market.ticker }}</p>
        <p class="text-[#E0E2E8] text-xs">{{ market.baseToken.name }}</p>
      </div>
    </div>

    <p
      v-if="description"
      class="block text-[#E0E2E8] text-sm leading-normal tracking-wide my-6"
    >
      {{ description }}
    </p>

    <div
      class="text-[#E0E2E8] text-xs xl:text-sm tracking-wider flex flex-col gap-6"
    >
      <div class="flex justify-between">
        <p>{{ $t('trade.marketName') }}:</p>
        <p>{{ market.ticker }}</p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('trade.tickSize') }}:</p>
        <p>
          {{ priceTickSize }}
        </p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('trade.minLimitOrderSize') }}:</p>
        <p>{{ quantityTickSize }}</p>
      </div>

      <div v-if="!isSpot" class="flex justify-between">
        <p>{{ $t('trade.maxLeverage') }}:</p>
        <p>{{ maxLeverage }}</p>
      </div>

      <div class="flex gap-8 flex-wrap">
        <p class="whitespace-nowrap">{{ $t('markets.marketId') }}:</p>

        <div class="flex justify-end items-center gap-2 flex-1 min-w-0">
          <p class="truncate">{{ market.marketId }}</p>
          <UIcon
            :name="NuxtUiIcons.Copy3"
            class="text-sm shrink-0 hover:opacity-70 transition-opacity"
            @click="onCopy"
          />
        </div>
      </div>
    </div>
  </div>
</template>
