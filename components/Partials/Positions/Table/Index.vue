<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BusEvents, PositionTableColumn, PerpetualMarketCyTags } from '@/types'
import type { TransformedPosition } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const jsonStore = useSharedJsonStore()
const breakpoints = useSharedBreakpoints()
const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    positions: PositionV2[]
    isTradingBots?: boolean
    ui?: Record<string, any>
  }>(),
  {
    isTradingBots: false,
    ui: () => ({
      td: {
        font: 'font-sans'
      },
      th: {
        base: 'whitespace-nowrap'
      }
    })
  }
)

const emit = defineEmits<{
  'tpsl:add': [position: PositionV2]
  'margin:add': [position: PositionV2]
  'position:share': [state: PositionV2]
}>()

const appStore = useAppStore()
const positionStore = usePositionStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { rows } = usePositionTransformer(computed(() => props.positions))

const sixXl = breakpoints['6xl']

const selectedPositionQuantity = ref('0')
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

  positionStore
    .closePosition({
      quantity: selectedPositionQuantity.value,
      position: selectedPositionDetails.value.position,
      availablePositionQuantity: selectedPositionDetails.value.quantity
    })
    .then(() =>
      notificationStore.success({ title: t('trade.position_closed') })
    )
    .catch($onError)
    .finally(() => {
      setPositionStatusIdle()
    })
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
        <div class="flex items-center justify-end p-2 text-white">
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
        <div class="flex items-center justify-end p-2 text-white">
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
                class="text-white"
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
          <AppAmount
            v-bind="{
              amount: row.liquidationPrice.toFixed(),
              decimalPlaces: row.priceDecimals
            }"
            class="text-white"
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
            class="text-white"
          />x
        </div>
      </template>

      <template #tp-or-sl-data="{ row }">
        <div class="flex items-center p-2 justify-center">
          <AppTooltip
            :ui="{ width: 'w-auto' }"
            :content="$t('trade.postOnlyWarning')"
            :is-disabled="!jsonStore.isPostUpgradeMode"
          >
            <button
              :disabled="
                appStore.isCountryRestricted || jsonStore.isPostUpgradeMode
              "
              class="flex p-2 focus-visible:outline-none"
              @click="addTpSl(row.position)"
            >
              <div
                class="flex rounded-full transition"
                :class="{
                  'hover:bg-coolGray-600': !appStore.isCountryRestricted
                }"
              >
                <UIcon
                  :name="NuxtUiIcons.CirclePlus"
                  class="h-6 w-6 min-w-6"
                  :class="{
                    'text-coolGray-700':
                      appStore.isCountryRestricted ||
                      jsonStore.isPostUpgradeMode
                  }"
                />
              </div>
            </button>
          </AppTooltip>
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
      @position:set="setSelectedPosition"
      @tpsl:add="addTpSl(position.position)"
      @margin:add="addMargin(position.position)"
      @position:share="sharePosition(position.position)"
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
  />
</template>
