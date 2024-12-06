<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  MarketCyTags,
  MarketsTableColumn,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'
import { valueSortFunction } from '~/app/utils/helpers'

const { t } = useLang()
const appStore = useAppStore()
const { lg } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{
    sortedMarkets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {}
)

const { rows } = useMarketTransformer(computed(() => props.sortedMarkets))

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

const { sortedRows, sortBy, sortDirection, sortOptions } = useSort(
  rows,
  columns
)
</script>

<template>
  <template v-if="lg">
    <UTable
      :rows="rows"
      :columns="columns"
      :sort-asc-icon="NuxtUiIcons.TriangleUp"
      :sort-desc-icon="NuxtUiIcons.TriangleDown"
      :ui="{
        th: { color: 'dark:text-coolGray-500' },
        tr: { base: 'text-coolGray-350 hover:text-white' },
        td: { color: 'text-inherit p-4' }
      }"
    >
      <template #markets-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center"
        >
          <div class="w-full flex items-center truncate">
            <CommonTokenIcon v-bind="{ token: row.market.baseToken }" />

            <div class="ml-2">
              <CommonHeaderTooltip
                :tooltip="$t('trade.rwa.marketClosedMarketRow')"
                :is-disabled="!row.isRwaMarket"
                is-not-styled
                text-color-class="text-white"
                :classes="
                  row.isRwaMarket ? 'border-dashed border-b cursor-pointer' : ''
                "
                tooltip-class="text-xs"
                :ui="{
                  base: '-translate-y-0.5'
                }"
              >
                <span
                  class="text-base"
                  :data-cy="dataCyTag(MarketCyTags.MarketTicker)"
                >
                  {{ row.market.ticker }}
                </span>
              </CommonHeaderTooltip>

              <div class="flex items-center gap-1">
                <div
                  class="text-xs font-normal text-coolGray-500"
                  :data-cy="`${dataCyTag(MarketCyTags.MarketBaseToken)}-${
                    row.market.baseToken.name
                  }`"
                >
                  {{ row.market.baseToken.name }}
                </div>

                <div v-if="!row.isVerified">
                  <UTooltip
                    :text="$t('markets.permisionlessWarning')"
                    class="flex"
                  >
                    <UIcon
                      name="clarity:shield-line"
                      class="text-gray-400 size-3"
                    />
                  </UTooltip>
                </div>
              </div>
            </div>
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #last-price-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center"
        >
          <div class="w-full flex justify-end truncate font-mono">
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
            class="w-full flex items-center truncate font-mono justify-end"
            :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
          >
            {{ row[MarketsTableColumn.MarketChange24h] }}%
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #market-volume-24h-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center"
        >
          <div class="w-full flex items-center justify-end truncate font-mono">
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
              class="text-blue-500 hover:text-blue-600 text-base"
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
              class="pr-2 w-8 h-6 text-coolGray-700 hover:text-blue-700"
              @click.stop.prevent="toggleFavorite(row)"
            >
              <UIcon :name="NuxtUiIcons.Star" class="h-6 w-6 min-w-6" />
            </div>
          </div>
        </PartialsCommonMarketRedirection>
      </template>
    </UTable>
  </template>

  <template v-else>
    <AppMobileSort
      v-model:sort-by="sortBy"
      v-model:sort-direction="sortDirection"
      :sort-options="sortOptions"
    />

    <PartialsMarketsCommonMobileTable
      v-for="market in sortedRows"
      :key="market.market.marketId"
      v-bind="{ market, columns }"
      @mobile-table:click="toggleFavorite(market)"
    />
  </template>
</template>
