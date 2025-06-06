<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { abbreviateNumber } from '@/app/utils/formatters'
import {
  MarketCyTags,
  UTableColumn,
  TransformedMarkets,
  MarketsTableColumn
} from '@/types'

const appStore = useAppStore()

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    market: TransformedMarkets
  }>(),
  {}
)

const emit = defineEmits<{
  'mobile-table:click': []
}>()

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    const removedKey = [MarketsTableColumn.Markets, MarketsTableColumn.Action]

    if (removedKey.includes(column.key as MarketsTableColumn)) {
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
  <AppMobileTable :columns="filteredColumns" extra-class="py-6">
    <template #header>
      <div class="flex items-start flex-wrap gap-2 mb-6 justify-between">
        <div class="w-full flex items-center truncate">
          <PartialsMarketsCommonMarketInfo
            include-name
            :market="market.market"
          />
        </div>

        <PartialsCommonMarketRedirection
          :market="market.market"
          class="flex items-center"
        >
          <div class="w-full flex items-center space-x-2 justify-end">
            <NuxtLink
              class="flex items-center leading-none gap-1.5 py-2 px-3 text-xs bg-blue-500 text-blue-900 border-blue-500 hover:bg-blue-500/70 hover:border-blue-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-blue-500 focus-within:ring-[3px] ring-blue-700 rounded-lg font-medium"
              :data-cy="`${dataCyTag(MarketCyTags.MarketTrade)}-${
                market.market.marketId
              }`"
            >
              {{ $t('trade.trade') }}
            </NuxtLink>

            <div
              :class="{
                '!text-blue-500': appStore.favoriteMarkets.includes(
                  market.market.marketId
                )
              }"
              class="text-coolGray-700"
              @click.stop.prevent="toggleFavorite"
            >
              <UIcon :name="NuxtUiIcons.Star" class="size-6 block" />
            </div>
          </div>
        </PartialsCommonMarketRedirection>
      </div>
    </template>

    <template #last-price-data>
      <PartialsCommonMarketRedirection
        :market="market.market"
        class="flex items-center"
      >
        <div class="w-full truncate">
          <AppAmount
            :data-cy="dataCyTag(MarketCyTags.MarketLastPrice)"
            v-bind="{
              amount: market[MarketsTableColumn.LastPrice],
              decimalPlaces: market.market.priceDecimals
            }"
          />
        </div>
      </PartialsCommonMarketRedirection>
    </template>

    <template #market-change-24h-data>
      <PartialsCommonMarketRedirection
        :market="market.market"
        class="flex items-center"
      >
        <div
          :class="market.priceChangeClasses"
          class="w-full flex items-center truncate justify-end"
          :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
        >
          {{ market.formattedChange }}%
        </div>
      </PartialsCommonMarketRedirection>
    </template>

    <template #market-volume-24h-data>
      <PartialsCommonMarketRedirection
        :market="market.market"
        class="flex items-center"
      >
        <div class="w-full flex items-center truncate">
          <div>
            <span>$</span>
            <span v-if="abbreviateNumber(market.volumeInUsd.toFixed())">
              {{ abbreviateNumber(market.volumeInUsd.toFixed()) }}
            </span>
            <span v-else>
              <AppUsdAmount
                v-bind="{
                  amount: market.volumeInUsd.toFixed(),
                  isShowNoDecimals: true,
                  decimalPlaces: 0
                }"
              />
            </span>
          </div>
        </div>
      </PartialsCommonMarketRedirection>
    </template>
  </AppMobileTable>
</template>
