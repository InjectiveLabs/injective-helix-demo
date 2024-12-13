<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { valueSortFunction } from '~/app/utils/helpers'
import { abbreviateNumber } from '@/app/utils/formatters'
import { UI_DEFAULT_FUNDING_RATE_DECIMALS } from '@/app/utils/constants'
import {
  MarketCyTags,
  MarketsSelectorTableColumn,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

const { t } = useLang()
const appStore = useAppStore()
const isMobile = useIsMobile()
const { lg } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{
    marketPriceMap?: Record<string, BigNumberInBase>
    sortedMarkets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {
    marketPriceMap: () => ({})
  }
)

const { rows } = useMarketSelectorTransformer(
  computed(() => props.sortedMarkets),
  computed(() => props.marketPriceMap)
)

const columns = computed(() => {
  const columnList = [
    {
      key: MarketsSelectorTableColumn.Markets,
      label: t(
        `trade.table.marketsSelector.${MarketsSelectorTableColumn.Markets}`
      ),
      sortable: true,
      class: 'w-[23%]'
    },
    {
      key: MarketsSelectorTableColumn.LastPrice,
      label: t(
        `trade.table.marketsSelector.${MarketsSelectorTableColumn.LastPrice}`
      ),
      class: 'text-right'
    },
    {
      key: MarketsSelectorTableColumn.MarketChange24h,
      label: t(
        `trade.table.marketsSelector.${MarketsSelectorTableColumn.MarketChange24h}`
      ),
      sortable: true,
      sort: valueSortFunction,
      class: 'text-right'
    },
    {
      key: MarketsSelectorTableColumn.FundingRate,
      label: t(
        `trade.table.marketsSelector.${MarketsSelectorTableColumn.FundingRate}`
      ),
      sortable: true,
      sort: valueSortFunction,
      class: 'text-right'
    },
    {
      key: MarketsSelectorTableColumn.MarketVolume24h,
      label: t(
        `trade.table.marketsSelector.${MarketsSelectorTableColumn.MarketVolume24h}`
      ),
      sortable: true,
      sort: valueSortFunction,
      class: 'text-right'
    }
    // {
    //   key: MarketsSelectorTableColumn.OpenInterest,
    //   label: t(
    //     `trade.table.marketsSelector.${MarketsSelectorTableColumn.OpenInterest}`
    //   ),
    //   sortable: true,
    //   sort: valueSortFunction,
    //   class: 'text-right'
    // }
  ]

  if (!lg.value) {
    columnList.splice(3, 1)
    columnList.pop()
  }

  return columnList
})

const { sortedRows, sortBy, sortDirection, sortOptions } = useSort(
  rows,
  columns
)

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
        th: {
          color: 'dark:text-coolGray-450',
          padding: 'px-2 first:pl-4 last:pr-4'
        },
        tr: { base: 'hover:bg-brand-800' },
        td: { color: 'text-coolGray-350', padding: 'px-2 py-1 ' }
      }"
    >
      <template #markets-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div class="flex items-center truncate min-w-0">
            <div
              :class="{
                '!text-blue-500': appStore.favoriteMarkets.includes(
                  row.market.marketId
                )
              }"
              class="pr-2 w-8 text-coolGray-700 hover:text-blue-700"
              @click.stop.prevent="toggleFavorite(row)"
            >
              <UIcon
                :name="NuxtUiIcons.Star"
                class="h-6 w-6 min-w-6 align-bottom"
              />
            </div>

            <CommonTokenIcon v-bind="{ token: row.market.baseToken }" />

            <div class="ml-2">
              <div class="flex items-center gap-2">
                <CommonHeaderTooltip
                  :tooltip="$t('trade.rwa.marketClosedMarketRow')"
                  :is-disabled="!row.isRWAMarket"
                  is-not-styled
                  text-color-class="text-white"
                  :classes="
                    row.isRWAMarket
                      ? 'border-dashed border-b cursor-pointer'
                      : ''
                  "
                  tooltip-class="text-sm"
                  :popper="{
                    placement: 'top',
                    strategy: 'fixed',
                    offsetDistance: -40
                  }"
                  :ui="{
                    base: 'translate-y-2.5'
                  }"
                >
                  <span
                    :data-cy="dataCyTag(MarketCyTags.MarketTicker)"
                    class="text-sm"
                  >
                    {{ row.market.ticker }}
                  </span>
                </CommonHeaderTooltip>

                <div
                  v-if="row.leverage.gt(0)"
                  class="text-2xs bg-blue-500 bg-opacity-20 p-1 font-semibold rounded-md text-blue-550"
                >
                  {{ row.leverageToFixed }}x
                </div>
              </div>
            </div>
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #last-price-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div
            class="flex justify-end truncate min-w-0 font-mono text-sm text-right"
          >
            <AppAmount
              :data-cy="dataCyTag(MarketCyTags.MarketLastPrice)"
              v-bind="{
                amount: row[MarketsSelectorTableColumn.LastPrice],
                decimalPlaces: row.market.priceDecimals
              }"
            />
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #market-change-24h-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div
            :class="row.priceChangeClasses"
            class="flex items-center truncate min-w-0 font-mono text-sm justify-end"
            :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
          >
            {{ row.formattedChange }}%
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #funding-rate-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div
            class="flex items-center justify-end truncate min-w-0 font-mono text-sm"
          >
            <span v-if="row[MarketsSelectorTableColumn.FundingRate].isZero()">
              &mdash;
            </span>
            <span
              v-else
              :class="{
                'text-green-500':
                  row[MarketsSelectorTableColumn.FundingRate].gte(0),
                'text-red-500':
                  row[MarketsSelectorTableColumn.FundingRate].lt(0)
              }"
              class="cursor-pointer flex"
            >
              <span>
                {{
                  row[MarketsSelectorTableColumn.FundingRate].gt(0) ? '+' : ''
                }}
              </span>
              <AppAmount
                v-bind="{
                  amount: row[MarketsSelectorTableColumn.FundingRate].toFixed(),
                  decimalPlaces: UI_DEFAULT_FUNDING_RATE_DECIMALS
                }"
              />
              <span>%</span>
            </span>
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #market-volume-24h-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div
            class="flex items-center justify-end truncate min-w-0 font-mono text-sm"
          >
            <span v-if="isMobile">
              <span>$</span>
              <span v-if="abbreviateNumber(row.volumeInUsdToFixed)">
                {{ abbreviateNumber(row.volumeInUsdToFixed) }}
              </span>
              <span v-else>
                <AppUsdAmount
                  v-bind="{
                    decimalPlaces: 0,
                    isShowNoDecimals: true,
                    amount: row.volumeInUsd.toFixed()
                  }"
                />
              </span>
            </span>
            <span v-else :data-cy="dataCyTag(MarketCyTags.MarketVolume)">
              <span>$</span>
              <AppUsdAmount
                v-bind="{
                  decimalPlaces: 0,
                  isShowNoDecimals: true,
                  amount: row.volumeInUsd.toFixed()
                }"
              />
            </span>
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <!-- <template #open-interest-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div
            class="flex items-center justify-end flex-[2] truncate min-w-0 font-mono text-sm"
          >
            <span v-if="row[MarketsSelectorTableColumn.OpenInterest].isZero()">
              &mdash;
            </span>
            <span v-else>
              <span>$</span>
              <AppUsdAmount
                v-bind="{
                  decimalPlaces: 0,
                  isShowNoDecimals: true,
                  amount: row[MarketsSelectorTableColumn.OpenInterest].toFixed()
                }"
              />
            </span>
          </div>
        </PartialsCommonMarketRedirection>
      </template> -->
    </UTable>
  </template>
  <template v-else>
    <AppMobileSort
      v-model:sort-by="sortBy"
      v-model:sort-direction="sortDirection"
      :sort-options="sortOptions"
      class="mb-3"
    />

    <PartialsTradeStatsMarketSelectorMobileTable
      v-for="market in sortedRows"
      :key="market.market.marketId"
      v-bind="{ market, columns }"
      @mobile-table:click="toggleFavorite(market)"
    />
  </template>
</template>
