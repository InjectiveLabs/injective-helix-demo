<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { OrderSide } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BusEvents, PositionTableColumn, PerpetualMarketCyTags } from '@/types'
import type { TransformedPosition } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    positions: PositionV2[]
    isTradingBots?: boolean
    ui?: Record<string, any>
  }>(),
  {
    ui: () => ({
      td: { font: 'font-sans' },
      th: { base: 'whitespace-nowrap' }
    })
  }
)

const emit = defineEmits<{
  'tpsl:add': [position: PositionV2]
  'margin:add': [position: PositionV2]
  'position:share': [state: PositionV2]
}>()

const appStore = useAppStore()
const jsonStore = useSharedJsonStore()
const positionStore = usePositionStore()
const breakpoints = useSharedBreakpoints()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { lg } = useSharedBreakpoints()
const { rows } = usePositionTransformer(computed(() => props.positions))

const sixXl = breakpoints['6xl']

const selectedPositionQuantity = ref('0')
const selectedPositionLimitPrice = ref(ZERO_IN_BASE)
const selectedPositionDetails = ref<undefined | TransformedPosition>()

const columns = computed(() => {
  const baseColumns = [
    {
      class: 'w-[8%]',
      key: PositionTableColumn.Market,
      label: t(`portfolio.table.position.${PositionTableColumn.Market}`)
    },
    {
      class: 'w-[4%]',
      key: PositionTableColumn.Side,
      label: t(`portfolio.table.position.${PositionTableColumn.Side}`)
    },
    {
      class: 'text-right w-[6%]',
      key: PositionTableColumn.Contracts,
      label: t(`portfolio.table.position.${PositionTableColumn.Contracts}`)
    },
    {
      class: 'text-right w-[8%]',
      key: PositionTableColumn.Entry,
      label: t(`portfolio.table.position.${PositionTableColumn.Entry}`)
    },
    {
      class: 'text-right w-[8%]',
      key: PositionTableColumn.Mark,
      label: t(`portfolio.table.position.${PositionTableColumn.Mark}`)
    },
    {
      class: 'text-right w-[8%]',
      key: PositionTableColumn.UnrealizedPnl,
      label: t(`portfolio.table.position.${PositionTableColumn.UnrealizedPnl}`)
    },
    {
      class: 'text-right w-[8%]',
      key: PositionTableColumn.TotalUsd,
      label: t(`portfolio.table.position.${PositionTableColumn.TotalUsd}`)
    },
    {
      class: 'text-right w-[8%]',
      key: PositionTableColumn.LiquidationPrice,
      label: t(
        `portfolio.table.position.${PositionTableColumn.LiquidationPrice}`
      )
    },
    {
      class: 'text-right w-[7%]',
      key: PositionTableColumn.Leverage,
      label: t(`portfolio.table.position.${PositionTableColumn.Leverage}`)
    }
  ]

  if (!props.isTradingBots) {
    baseColumns.splice(8, 0, {
      class: 'text-right w-[8%]',
      key: PositionTableColumn.Margin,
      label: t(`portfolio.table.position.${PositionTableColumn.Margin}`)
    })

    baseColumns.push({
      class: 'text-center w-[8%]',
      key: PositionTableColumn.TpOrSl,
      label: t(`portfolio.table.position.${PositionTableColumn.TpOrSl}`)
    })
  }

  if (sixXl.value && !props.isTradingBots) {
    baseColumns.push({
      class: 'text-center w-[8%]',
      key: PositionTableColumn.ClosePosition,
      label: t(`portfolio.table.position.${PositionTableColumn.ClosePosition}`)
    })
  }

  return baseColumns
})

function addMargin(position: PositionV2) {
  emit('margin:add', position)
}

function sharePosition(position: PositionV2) {
  emit('position:share', position)
}

function setSelectedPositionQuantity(quantity: string) {
  selectedPositionQuantity.value = quantity
}

function setSelectedPositionLimitPrice(price: string) {
  selectedPositionLimitPrice.value = new BigNumberInBase(price || 0)
}

function setSelectedPosition(value: undefined | TransformedPosition) {
  selectedPositionDetails.value = value
}

function setPositionStatusIdle() {
  useEventBus(BusEvents.SetPositionStatusIdle).emit()
  setSelectedPosition(undefined)
}

function addTpSl(position: PositionV2) {
  if (jsonStore.isPostUpgradeMode) {
    return
  }

  emit('tpsl:add', position)
}

function onClosePartialPosition() {
  if (!selectedPositionDetails.value || jsonStore.isPostUpgradeMode) {
    return
  }

  if (selectedPositionLimitPrice.value.isZero()) {
    positionStore
      .closePosition({
        quantity: selectedPositionQuantity.value,
        position: selectedPositionDetails.value.position,
        availablePositionQuantity: selectedPositionDetails.value.quantity
      })
      .then(() =>
        notificationStore.update({ title: t('toast.trade.positionClosed') })
      )
      .catch($onError)
      .finally(() => {
        setPositionStatusIdle()
      })
  } else {
    const isBuy =
      selectedPositionDetails.value.position.direction === TradeDirection.Long

    let orderTypeToSubmit = OrderSide.Buy

    if (jsonStore.isPostUpgradeMode) {
      orderTypeToSubmit = isBuy ? OrderSide.SellPO : OrderSide.BuyPO
    } else {
      orderTypeToSubmit = isBuy ? OrderSide.Sell : OrderSide.Buy
    }

    derivativeStore
      .submitLimitOrder({
        reduceOnly: true,
        orderSide: orderTypeToSubmit,
        margin: selectedPositionDetails.value.margin,
        market: selectedPositionDetails.value.market,
        quantity: new BigNumberInBase(selectedPositionQuantity.value),
        price: new BigNumberInBase(selectedPositionLimitPrice.value.toFixed())
      })
      .then(() =>
        notificationStore.update({ title: t('toast.trade.orderPlaced') })
      )
      .catch($onError)
      .finally(() => {
        setPositionStatusIdle()
      })
  }

  return
}
</script>

<template>
  <template v-if="lg">
    <UTable v-bind="{ rows, columns, ui }">
      <template #market-data="{ row }">
        <div class="flex items-center gap-1">
          <PartialsCommonMarketRedirection
            v-bind="{ market: row.market }"
            class="flex items-center space-x-2 p-2 font-sans text-coolGray-200"
          >
            <CommonTokenIcon
              v-bind="{ isMd: true, token: row.market.baseToken }"
            />
            <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosMarketTicker)">
              {{ row.market.ticker }}
            </p>
          </PartialsCommonMarketRedirection>

          <PartialsPositionsTableClosePositionButton
            v-if="!sixXl && !isTradingBots"
            :data-cy="
              dataCyTag(PerpetualMarketCyTags.PositionsTableClosePositionButton)
            "
            v-bind="{ row }"
            @position:set="setSelectedPosition"
          />
        </div>
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
        <div
          class="flex items-center justify-end gap-1 p-2"
          :class="[
            row.availableQuantity.lte(0) ? 'text-coolGray-500' : 'text-white'
          ]"
        >
          <PartialsPositionsRemainingQuantity
            v-if="row.usedQuantity.gt(0)"
            v-bind="{ market: row.market, usedQuantity: row.usedQuantity }"
          />

          <p
            class="flex gap-1"
            :class="{
              'line-through ': row.availableQuantity.lte(0)
            }"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosAmount)"
          >
            <SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                decimals: row.quantityDecimals,
                amount: row.availableQuantity.toFixed()
              }"
            />
            {{
              row.market.baseToken.overrideSymbol || row.market.baseToken.symbol
            }}
          </p>
        </div>
      </template>

      <template #entry-data="{ row }">
        <div class="flex items-center justify-end p-2 text-white">
          <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenEntryPrice)">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: row.price.toFixed(),
                decimals: row.priceDecimals
              }"
            />
          </p>
        </div>
      </template>

      <template #mark-data="{ row }">
        <div class="flex items-center justify-end p-2">
          <p>
            <SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                decimals: row.priceDecimals,
                amount: row.markPrice.toFixed()
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
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: row.pnl.toFixed(),
                  decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
              />

              <span class="text-coolGray-500">{{
                row.market.quoteToken.symbol
              }}</span>
            </p>
            <p class="flex">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: row.percentagePnl.toFixed(),
                  decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
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
              <SharedAmountUsd
                class="text-white"
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
            <SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: row.margin.toFixed(),
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </span>
          <button
            v-if="!appStore.isCountryRestricted"
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
          <SharedAmount
            class="text-white"
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              decimals: row.priceDecimals,
              amount: row.liquidationPrice.toFixed()
            }"
          />
        </div>
      </template>

      <template #leverage-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosLeverage)"
        >
          <SharedAmount
            class="text-white"
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: row.effectiveLeverage.toFixed(),
              decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />x
        </div>
      </template>

      <template #tp-or-sl-data="{ row }">
        <div class="flex items-center p-2 justify-center">
          <PartialsPositionsTableTpSlPrice
            v-if="row.hasTpSl"
            v-bind="{
              position: row.position,
              priceDecimals: row.priceDecimals,
              tpTriggerPrice: row.tpTriggerPrice,
              slTriggerPrice: row.slTriggerPrice
            }"
            @tpsl:update="addTpSl"
          />

          <PartialsPositionsTableTpSlButton
            v-else
            v-bind="{ position: row.position }"
            @tpsl:add="addTpSl"
          />
        </div>
      </template>

      <template #close-position-data="{ row }">
        <PartialsPositionsTableClosePositionButton
          v-bind="{ row }"
          @position:set="setSelectedPosition"
        />
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPositionsMobileTable
      v-for="position in rows"
      :key="`${position.position.marketId}-${position.position.subaccountId}-${position.position.entryPrice}`"
      :is-trading-bots="isTradingBots"
      v-bind="{ position, columns }"
      @tpsl:add="addTpSl"
      @margin:add="addMargin"
      @position:share="sharePosition"
      @position:set="setSelectedPosition"
    />
  </template>

  <ModalsClosePositionWarning
    @on:close="setPositionStatusIdle"
    @position:close="onClosePartialPosition"
  />

  <ModalsPartialClosePosition
    v-if="selectedPositionDetails"
    v-bind="{ row: selectedPositionDetails }"
    @position:set="setSelectedPosition"
    @position:close="onClosePartialPosition"
    @position:set-quantity="setSelectedPositionQuantity"
    @position:set-limit-price="setSelectedPositionLimitPrice"
  />
</template>
