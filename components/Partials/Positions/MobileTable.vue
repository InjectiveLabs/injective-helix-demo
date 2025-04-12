<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { PositionTableColumn, PerpetualMarketCyTags } from '@/types'
import type { UTableColumn, TransformedPosition } from '@/types'

const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    isTradingBots?: boolean
    position: TransformedPosition
  }>(),
  {
    isTradingBots: false
  }
)

const emit = defineEmits<{
  'tpsl:add': []
  'margin:add': []
  'position:share': []
  'position:set': [TransformedPosition]
}>()

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    const removedKey = [
      PositionTableColumn.Market,
      PositionTableColumn.TpOrSl,
      PositionTableColumn.ClosePosition
    ]

    if (removedKey.includes(column.key as PositionTableColumn)) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)

function addTpSl() {
  emit('tpsl:add')
}

function addMargin() {
  emit('margin:add')
}

function sharePosition() {
  emit('position:share')
}

function onSetPosition(value: TransformedPosition) {
  emit('position:set', value)
}
</script>

<template>
  <AppMobileTable :columns="filteredColumns">
    <template #header>
      <div class="flex items-start flex-wrap gap-2 mb-6 justify-between">
        <PartialsCommonMarketRedirection
          class="flex items-center space-x-2 font-sans"
          v-bind="{ market: position.market }"
        >
          <CommonTokenIcon
            v-bind="{ token: position.market.baseToken }"
            :is-sm="true"
          />
          <p
            class="text-sm text-coolGray-200"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosMarketTicker)"
          >
            {{ position.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>

        <div v-if="!isTradingBots" class="flex space-x-2">
          <AppButton
            size="sm"
            class="py-2"
            :disabled="jsonStore.isPostUpgradeMode"
            @click="addTpSl"
          >
            <span>
              {{ $t('trade.addTpSl') }}
            </span>
          </AppButton>

          <PartialsPositionsTableClosePositionButton
            v-bind="{ row: position }"
            @position:set="onSetPosition"
          />
        </div>
      </div>
    </template>

    <template #side-data>
      <span
        :class="{
          'text-green-500': position.position.direction === TradeDirection.Long,
          'text-red-500': position.position.direction === TradeDirection.Short
        }"
        :data-cy="`${dataCyTag(PerpetualMarketCyTags.OpenPosTradeDirection)}-${
          position.position.direction
        }`"
      >
        {{ $t(`trade.${position.position.direction}`) }}
      </span>
    </template>

    <template #contracts-data>
      <p
        :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosAmount)"
        class="flex gap-1"
      >
        <AppAmount
          v-bind="{
            amount: position.quantity.toFixed(),
            decimalPlaces: position.quantityDecimals
          }"
        />
        {{
          position.market.baseToken.overrideSymbol ||
          position.market.baseToken.symbol
        }}
      </p>
    </template>

    <template #entry-data>
      <div class="space-y-1 flex flex-col">
        <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenEntryPrice)">
          <AppAmount
            v-bind="{
              amount: position.price.toFixed(),
              decimalPlaces: position.priceDecimals
            }"
          />
        </p>
      </div>
    </template>

    <template #mark-data>
      <div class="space-y-1 flex flex-col text-coolGray-475">
        <AppAmount
          v-bind="{
            amount: position.markPrice.toFixed(),
            decimalPlaces: position.priceDecimals
          }"
        />
      </div>
    </template>

    <template #unrealized-pnl-data>
      <div class="flex items-center space-x-1">
        <div
          class="space-y-1 text-right"
          :class="{
            'text-green-500': position.pnl.gte(0),
            'text-red-500': position.pnl.lt(0)
          }"
        >
          <p
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosUnrealizedPnl)"
            class="flex gap-1"
          >
            <AppAmount
              v-bind="{
                amount: position.pnl.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />

            <span class="text-coolGray-500">{{
              position.market.quoteToken.symbol
            }}</span>
          </p>
          <p class="flex">
            <AppAmount
              v-bind="{
                amount: position.percentagePnl.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
            %
          </p>
        </div>

        <UIcon
          :name="NuxtUiIcons.Share"
          class="text-coolGray-500 hover:text-coolGray-400 w-4 h-4 min-w-4"
          @click="sharePosition"
        />
      </div>
    </template>

    <template #total-usd-data>
      <div class="space-y-1">
        <p
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosTotalValue)"
          class="flex"
        >
          <AppUsdAmount
            v-bind="{
              amount: position.quantityInUsd.toFixed()
            }"
          />
        </p>
      </div>
    </template>

    <template #margin-data>
      <div class="flex items-center space-x-2">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosMargin)">
          <AppAmount
            v-bind="{
              amount: position.margin.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
        </span>
        <button
          class="flex p-1.5 rounded-full bg-coolGray-800"
          @click="addMargin"
        >
          <UIcon :name="NuxtUiIcons.Plus" class="h-3.5 w-3.5 min-w-3.5" />
        </button>
      </div>
    </template>

    <template #liquidation-price-data>
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosLiquidationPrice)">
        <AppAmount
          v-bind="{
            amount: position.liquidationPrice.toFixed(),
            decimalPlaces: position.priceDecimals
          }"
        />
      </div>
    </template>

    <template #leverage-data>
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosLeverage)">
        <AppAmount
          v-bind="{
            amount: position.effectiveLeverage.toFixed(),
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />x
      </div>
    </template>
  </AppMobileTable>
</template>
