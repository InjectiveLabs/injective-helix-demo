<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { Position, PositionV2, TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { PositionTableColumn, PerpetualMarketCyTags } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{
    positions: PositionV2[] | Position[]
    ui?: Record<string, any>
  }>(),
  {
    ui: () => ({
      th: {
        base: 'whitespace-nowrap'
      },
      td: {
        font: 'font-mono'
      }
    })
  }
)

const { rows } = usePositionTransformer(computed(() => props.positions))

const emit = defineEmits<{
  'tpsl:add': [position: Position | PositionV2]
  'margin:add': [position: Position | PositionV2]
  'position:share': [state: Position | PositionV2]
}>()

const columns = [
  {
    key: PositionTableColumn.Market,
    label: t(`portfolio.table.position.${PositionTableColumn.Market}`),
    class: 'w-[8%]'
  },
  {
    key: PositionTableColumn.Side,
    label: t(`portfolio.table.position.${PositionTableColumn.Side}`),
    class: 'w-[4%]'
  },
  {
    key: PositionTableColumn.Contracts,
    label: t(`portfolio.table.position.${PositionTableColumn.Contracts}`),
    class: 'text-right w-[6%]'
  },
  {
    key: PositionTableColumn.Entry,
    label: t(`portfolio.table.position.${PositionTableColumn.Entry}`),
    class: 'text-right w-[8%]'
  },
  {
    key: PositionTableColumn.Mark,
    label: t(`portfolio.table.position.${PositionTableColumn.Mark}`),
    class: 'text-right w-[8%]'
  },
  {
    key: PositionTableColumn.UnrealizedPnl,
    label: t(`portfolio.table.position.${PositionTableColumn.UnrealizedPnl}`),
    class: 'text-right w-[8%]'
  },
  {
    key: PositionTableColumn.TotalUsd,
    label: t(`portfolio.table.position.${PositionTableColumn.TotalUsd}`),
    class: 'text-right w-[8%]'
  },
  {
    key: PositionTableColumn.Margin,
    label: t(`portfolio.table.position.${PositionTableColumn.Margin}`),
    class: 'text-right w-[8%]'
  },
  {
    key: PositionTableColumn.LiquidationPrice,
    label: t(
      `portfolio.table.position.${PositionTableColumn.LiquidationPrice}`
    ),
    class: 'text-right w-[8%]'
  },
  {
    key: PositionTableColumn.Leverage,
    label: t(`portfolio.table.position.${PositionTableColumn.Leverage}`),
    class: 'text-right w-[7%]'
  },
  {
    key: PositionTableColumn.TpOrSl,
    label: t(`portfolio.table.position.${PositionTableColumn.TpOrSl}`),
    class: 'text-center w-[8%]'
  },
  {
    key: PositionTableColumn.ClosePosition,
    label: t(`portfolio.table.position.${PositionTableColumn.ClosePosition}`),
    class: 'w-[8%]'
  }
]

function addTpSl(position: PositionV2 | Position) {
  emit('tpsl:add', position)
}

function addMargin(position: PositionV2 | Position) {
  emit('margin:add', position)
}

function sharePosition(position: PositionV2 | Position) {
  emit('position:share', position)
}
</script>

<template>
  <template v-if="lg">
    <UTable v-bind="{ rows, columns, ui }">
      <template #market-data="{ row }">
        <PartialsCommonMarketRedirection
          v-bind="{ market: row.market }"
          class="flex items-center space-x-2 p-2 font-sans"
        >
          <CommonTokenIcon
            v-bind="{ isSm: true, token: row.market.baseToken }"
          />
          <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosMarketTicker)">
            {{ row.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>
      </template>

      <template #side-data="{ row }">
        <div class="flex items-center p-2">
          <span
            :class="{
              'text-green-500': row.position.direction === TradeDirection.Long,
              'text-red-500': row.position.direction === TradeDirection.Short
            }"
            :data-cy="`${dataCyTag(
              PerpetualMarketCyTags.OpenPosTradeDirection
            )}-${row.position.direction}`"
          >
            {{ $t(`trade.${row.position.direction}`) }}
          </span>
        </div>
      </template>

      <template #contracts-data="{ row }">
        <div class="flex items-center justify-end p-2">
          <p
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosAmount)"
            class="flex gap-1"
          >
            <AppAmount
              v-bind="{
                amount: row.quantity.toFixed(),
                decimalPlaces: row.quantityDecimals
              }"
            />
            {{
              row.market.baseToken.overrideSymbol || row.market.baseToken.symbol
            }}
          </p>
        </div>
      </template>

      <template #entry-data="{ row }">
        <div class="flex items-center justify-end p-2">
          <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenEntryPrice)">
            <AppAmount
              v-bind="{
                amount: row.price.toFixed(),
                decimalPlaces: row.priceDecimals
              }"
            />
          </p>
        </div>
      </template>

      <template #mark-data="{ row }">
        <div class="flex items-center justify-end p-2">
          <p>
            <AppAmount
              v-bind="{
                amount: row.markPrice.toFixed(),
                decimalPlaces: row.priceDecimals
              }"
              class="text-coolGray-475"
            />
          </p>
        </div>
      </template>

      <template #unrealized-pnl-data="{ row }">
        <div class="flex items-center p-2 justify-end space-x-1">
          <div
            class="space-y-1 text-right"
            :class="{
              'text-green-500': row.pnl.gte(0),
              'text-red-500': row.pnl.lt(0)
            }"
          >
            <p
              :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosUnrealizedPnl)"
              class="flex gap-1"
            >
              <AppAmount
                v-bind="{
                  amount: row.pnl.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
              />

              <span class="text-coolGray-500">{{
                row.market.quoteToken.symbol
              }}</span>
            </p>
            <p class="flex">
              <AppAmount
                v-bind="{
                  amount: row.percentagePnl.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
              />
              %
            </p>
          </div>

          <UIcon
            :name="NuxtUiIcons.Share"
            class="text-coolGray-500 hover:text-coolGray-400 w-4 h-4 min-w-4"
            @click="sharePosition(row.position)"
          />
        </div>
      </template>

      <template #total-usd-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <div class="space-y-1">
            <p
              :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosTotalValue)"
              class="flex"
            >
              <AppUsdAmount
                v-bind="{
                  amount: row.quantityInUsd.toFixed()
                }"
              />
            </p>
          </div>
        </div>
      </template>

      <template #margin-data="{ row }">
        <div class="flex items-center p-2 space-x-2 justify-end">
          <span :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosMargin)">
            <AppAmount
              v-bind="{
                amount: row.margin.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
          </span>
          <button
            class="flex p-2 rounded-full bg-coolGray-800"
            @click="addMargin(row.position)"
          >
            <UIcon :name="NuxtUiIcons.Plus" class="h-3.5 w-3.5 min-w-3.5" />
          </button>
        </div>
      </template>

      <template #liquidation-price-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosLiquidationPrice)"
        >
          <AppAmount
            v-bind="{
              amount: row.liquidationPrice.toFixed(),
              decimalPlaces: row.priceDecimals
            }"
          />
        </div>
      </template>

      <template #leverage-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosLeverage)"
        >
          <AppAmount
            v-bind="{
              amount: row.effectiveLeverage.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />x
        </div>
      </template>

      <template #tp-or-sl-data="{ row }">
        <div class="flex items-center p-2 justify-center">
          <button
            class="flex p-2 focus-visible:outline-none"
            @click="addTpSl(row.position)"
          >
            <div class="flex hover:bg-coolGray-600 rounded-full transition">
              <UIcon :name="NuxtUiIcons.CirclePlus" class="h-6 w-6 min-w-6" />
            </div>
          </button>
        </div>
      </template>

      <template #close-position-data="{ row }">
        <PartialsPortfolioPositionsTableActionBtns
          :position="row.position"
          :market="row.market"
          :pnl="row.pnl"
          :has-reduce-only-orders="row.hasReduceOnlyOrders"
          :reduce-only-current-orders="row.reduceOnlyCurrentOrders"
          :is-market-order-authorized="row.isMarketOrderAuthorized"
          :is-limit-order-authorized="row.isLimitOrderAuthorized"
          :quantity="row.quantity"
        />
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioPositionsMobileTable
      v-for="position in rows"
      :key="`${position.position.marketId}-${position.position.subaccountId}-${position.position.entryPrice}`"
      v-bind="{ position, columns }"
      @margin:add="addMargin(position.position)"
      @tpsl:add="addTpSl(position.position)"
      @position:share="sharePosition(position.position)"
    />
  </template>
</template>
