<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { rwaMarketsInIAssets } from '@/app/data/market'
import { MarketCyTags, MarketsSelectorTableColumn } from '@/types'
import type { UTableColumn, TransformedMarketsSelector } from '@/types'

const appStore = useAppStore()
const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    market: TransformedMarketsSelector
  }>(),
  {}
)

const emit = defineEmits<{
  'mobile-table:click': []
}>()

const showRwaTooltip = computed(
  () =>
    jsonStore.helixMarketCategoriesMap.rwa.includes(
      props.market.market.marketId
    ) || rwaMarketsInIAssets.includes(props.market.market.marketId)
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    const removedKey = [MarketsSelectorTableColumn.Markets]

    if (removedKey.includes(column.key as MarketsSelectorTableColumn)) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)

const toggleFavorite = () => {
  emit('mobile-table:click')
}
</script>

<template>
  <AppMobileTable
    :columns="filteredColumns"
    grid-class="grid gap-6 grid-cols-3"
    extra-class="py-3"
    is-always-three-column
  >
    <template #header>
      <div class="flex items-start flex-wrap gap-2 mb-6 justify-between">
        <PartialsCommonMarketRedirection
          :market="market.market"
          class="flex items-center"
        >
          <div class="w-full flex items-center truncate">
            <CommonTokenIcon v-bind="{ token: market.market.baseToken }" />

            <div class="ml-2">
              <div class="flex items-center gap-2">
                <CommonHeaderTooltip
                  :tooltip="
                    $t(
                      `trade.rwa.${
                        showRwaTooltip
                          ? 'rwaClosedMarketRow'
                          : 'nyseClosedMarketRow'
                      }`
                    )
                  "
                  :is-disabled="!market.isRWAMarket"
                  is-not-styled
                  text-color-class="text-white"
                  :classes="
                    market.isRWAMarket
                      ? 'border-dashed border-b cursor-pointer'
                      : ''
                  "
                  tooltip-class="text-xs"
                  :popper="{
                    placement: 'top',
                    strategy: 'fixed',
                    offsetDistance: -40
                  }"
                  :ui="{
                    base: '-translate-y-2 xs:translate-y-3'
                  }"
                >
                  <span
                    :data-cy="dataCyTag(MarketCyTags.MarketTicker)"
                    class="text-xs"
                  >
                    {{ market.market.ticker }}
                  </span>
                </CommonHeaderTooltip>

                <div
                  v-if="market.leverage.gt(0)"
                  class="text-2xs bg-blue-500 bg-opacity-20 p-1 font-semibold rounded-md text-blue-550"
                >
                  {{ market.leverageToFixed }}x
                </div>
              </div>
            </div>
          </div>
        </PartialsCommonMarketRedirection>

        <div
          :class="{
            '!text-blue-500': appStore.favoriteMarkets.includes(
              market.market.marketId
            )
          }"
          class="pr-2 w-8 text-coolGray-700"
          @click.stop.prevent="toggleFavorite"
        >
          <UIcon
            :name="NuxtUiIcons.Star"
            class="h-6 w-6 min-w-6 align-bottom"
          />
        </div>
      </div>
    </template>

    <template #last-price-data>
      <PartialsCommonMarketRedirection :market="market.market">
        <div class="truncate min-w-0 text-xs">
          <SharedAmount
            :data-cy="dataCyTag(MarketCyTags.MarketLastPrice)"
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              decimals: market.market.priceDecimals,
              amount: market[MarketsSelectorTableColumn.LastPrice]
            }"
          />
        </div>
      </PartialsCommonMarketRedirection>
    </template>

    <template #market-change-24h-data>
      <PartialsCommonMarketRedirection :market="market.market">
        <div
          :class="market.priceChangeClasses"
          class="truncate min-w-0 text-xs"
          :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
        >
          {{ market.formattedChange }}%
        </div>
      </PartialsCommonMarketRedirection>
    </template>

    <template #market-volume-24h-data>
      <PartialsCommonMarketRedirection :market="market.market">
        <div class="truncate min-w-0 text-xs">
          <SharedAmountUsd
            v-bind="{
              hideDecimals: true,
              amount: market.volumeInUsdToFixed,
              roundingMode: BigNumberInBase.ROUND_UP
            }"
          >
            <template #prefix>$</template>
          </SharedAmountUsd>
        </div>
      </PartialsCommonMarketRedirection>
    </template>
  </AppMobileTable>
</template>
