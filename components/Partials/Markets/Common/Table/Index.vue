<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { valueSortFunction } from '@/app/utils/helpers'
import {
  MarketCyTags,
  MarketsTableColumn,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

const appStore = useAppStore()
const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    sortedMarkets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {}
)

const columns = [
  {
    key: MarketsTableColumn.Markets,
    label: t(`trade.table.markets.${MarketsTableColumn.Markets}`),
    sortable: true,
    class: 'w-[28%]'
  },
  {
    key: MarketsTableColumn.LastPrice,
    label: t(`trade.table.markets.${MarketsTableColumn.LastPrice}`),
    class: 'text-right rtl:text-left'
  },
  {
    key: MarketsTableColumn.MarketChange24h,
    label: t(`trade.table.markets.${MarketsTableColumn.MarketChange24h}`),
    sortable: true,
    sort: valueSortFunction,
    class: 'text-right rtl:text-left'
  },
  {
    key: MarketsTableColumn.MarketVolume24h,
    label: t(`trade.table.markets.${MarketsTableColumn.MarketVolume24h}`),
    sortable: true,
    sort: valueSortFunction,
    class: 'text-right rtl:text-left'
  },
  {
    key: MarketsTableColumn.Action
  }
]

const { rows } = useMarketTransformer(computed(() => props.sortedMarkets))

function toggleFavorite(item: UiMarketAndSummaryWithVolumeInUsd) {
  appStore.setUserState({
    ...appStore.userState,
    favoriteMarkets: appStore.userState.favoriteMarkets.includes(
      item.market.marketId
    )
      ? appStore.userState.favoriteMarkets.filter(
          (marketId) => marketId !== item.market.marketId
        )
      : [...appStore.userState.favoriteMarkets, item.market.marketId]
  })
}
</script>

<template>
  <template v-if="lg">
    <UTable
      :rows="rows"
      :columns="columns"
      :sort-asc-icon="NuxtUiIcons.TriangleUp"
      :sort-desc-icon="NuxtUiIcons.TriangleDown"
      :ui="{
        divide: 'dark:divide-y-0 dark:border-[#181E31]',
        tbody: 'dark:divide-[#181E31]',
        th: {
          color: 'dark:text-coolGray-450',
          padding: 'first:pl-6 last:pr-6'
        },
        tr: { base: 'text-white hover:text-coolGray-350' },
        td: { color: 'text-inherit p-4', padding: 'first:pl-6 last:pr-6 py-3' }
      }"
    >
      <template #markets-data="{ row }">
        <PartialsMarketsCommonMarketInfo :market="row.market" include-name />
      </template>

      <template #last-price-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center"
        >
          <div class="w-full flex justify-end truncate">
            <AppAmount
              :data-cy="dataCyTag(MarketCyTags.MarketLastPrice)"
              v-bind="{
                amount: row[MarketsTableColumn.LastPrice],
                decimalPlaces: row.market.priceDecimals
              }"
            />
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #market-change-24h-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center"
        >
          <div
            :class="row.priceChangeClasses"
            class="w-full flex items-center truncate justify-end"
            :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
          >
            {{ row.formattedChange }}%
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #market-volume-24h-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center"
        >
          <div class="w-full flex items-center justify-end truncate">
            <span :data-cy="dataCyTag(MarketCyTags.MarketVolume)">
              <span>$</span>
              <AppUsdAmount
                v-bind="{
                  amount: row.volumeInUsd.toFixed(),
                  isShowNoDecimals: true,
                  decimalPlaces: 0
                }"
              />
            </span>
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #action-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center"
        >
          <div class="w-full flex items-center p-2 space-x-8 justify-end">
            <NuxtLink
              class="text-blue-500 hover:text-blue-600 text-sm font-medium"
              :data-cy="`${dataCyTag(MarketCyTags.MarketTrade)}-${
                row.market.marketId
              }`"
            >
              {{ $t('trade.trade') }}
            </NuxtLink>

            <div
              :class="{
                '!text-blue-500': appStore.favoriteMarkets.includes(
                  row.market.marketId
                )
              }"
              class="pr-2 text-coolGray-700 hover:text-blue-700"
              @click.stop.prevent="toggleFavorite(row)"
            >
              <UIcon :name="NuxtUiIcons.Star" class="size-5 block" />
            </div>
          </div>
        </PartialsCommonMarketRedirection>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsMarketsCommonMobileTable
      v-for="market in rows"
      :key="market.market.marketId"
      v-bind="{ market, columns }"
      @mobile-table:click="toggleFavorite(market)"
    />
  </template>
</template>
