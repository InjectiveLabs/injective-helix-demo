<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { valueSortFunction } from '@/app/utils/helpers'
import { UI_DEFAULT_FUNDING_RATE_DECIMALS } from '@/app/utils/constants'
import { MarketCyTags, MarketsSelectorTableColumn } from '@/types'
import type { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const appStore = useAppStore()
const isMobile = useIsMobile()
const { t } = useLang()
const { lg } = useSharedBreakpoints()

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
        <div class="flex items-center">
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

          <PartialsMarketsCommonMarketInfo :market="row.market" />
        </div>
      </template>

      <template #last-price-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div class="flex justify-end truncate min-w-0 text-sm text-right">
            <SharedAmount
              :data-cy="dataCyTag(MarketCyTags.MarketLastPrice)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                decimals: row.market.priceDecimals,
                amount: row[MarketsSelectorTableColumn.LastPrice]
              }"
            />
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #market-change-24h-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div
            :class="row.priceChangeClasses"
            class="flex items-center truncate min-w-0 text-sm justify-end"
            :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
          >
            {{ row.formattedChange }}%
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #funding-rate-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div class="flex items-center justify-end truncate min-w-0 text-sm">
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
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  decimals: UI_DEFAULT_FUNDING_RATE_DECIMALS,
                  amount: row[MarketsSelectorTableColumn.FundingRate].toFixed()
                }"
              >
                <template #prefix>
                  <span>
                    {{
                      row[MarketsSelectorTableColumn.FundingRate].gt(0)
                        ? '+'
                        : ''
                    }}
                  </span>
                </template>
              </SharedAmount>
              <span>%</span>
            </span>
          </div>
        </PartialsCommonMarketRedirection>
      </template>

      <template #market-volume-24h-data="{ row }">
        <PartialsCommonMarketRedirection :market="row.market">
          <div class="flex items-center justify-end truncate min-w-0 text-sm">
            <span v-if="isMobile">
              <SharedAmountUsd
                v-bind="{
                  hideDecimals: true,
                  amount: row.volumeInUsdToFixed,
                  roundingMode: BigNumberInBase.ROUND_UP
                }"
              >
                <template #prefix>$</template>
              </SharedAmountUsd>
            </span>
            <span v-else :data-cy="dataCyTag(MarketCyTags.MarketVolume)">
              <SharedAmountUsd
                v-bind="{
                  hideDecimals: true,
                  shouldAbbreviate: false,
                  amount: row.volumeInUsd.toFixed(),
                  roundingMode: BigNumberInBase.ROUND_UP
                }"
              >
                <template #prefix>$</template>
              </SharedAmountUsd>
            </span>
          </div>
        </PartialsCommonMarketRedirection>
      </template>
    </UTable>
  </template>
  <template v-else>
    <PartialsTradeStatsMarketSelectorMobileTable
      v-for="market in rows"
      :key="market.market.marketId"
      v-bind="{ market, columns }"
      @mobile-table:click="toggleFavorite(market)"
    />
  </template>
</template>
