<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  UTableColumn,
  PositionTableColumn,
  TransformedPosition,
  PerpetualMarketCyTags
} from '@/types'

const { t } = useLang()
const { sm, lg } = useTwBreakpoints()
const { $onError } = useNuxtApp()
const positionStore = usePositionStore()
const notificationStore = useSharedNotificationStore()

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    position: TransformedPosition
  }>(),
  {}
)

const emit = defineEmits<{
  'tpsl:add': []
  'margin:add': []
  'position:share': []
}>()

const marketCloseStatus = reactive(new Status(StatusType.Idle))

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

function closePositionClicked() {
  if (!props.position.market) {
    return
  }

  if (props.position.pnl.isNaN()) {
    return notificationStore.error({ title: t('trade.no_liquidity') })
  }

  if (props.position.hasReduceOnlyOrders) {
    return closePositionAndReduceOnlyOrders()
  }

  closePosition()
}

function closePosition() {
  if (!props.position.market) {
    return
  }

  marketCloseStatus.setLoading()

  positionStore
    .closePosition({
      position: props.position.position,
      market: props.position.market
    })
    .then(() =>
      notificationStore.success({ title: t('trade.position_closed') })
    )
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })
}

function closePositionAndReduceOnlyOrders() {
  if (!props.position.market) {
    return
  }

  marketCloseStatus.setLoading()

  positionStore
    .closePositionAndReduceOnlyOrders({
      market: props.position.market,
      position: props.position.position,
      reduceOnlyOrders: props.position.reduceOnlyCurrentOrders
    })
    .then(() =>
      notificationStore.success({ title: t('trade.position_closed') })
    )
    .catch($onError)
    .finally(() => {
      marketCloseStatus.setIdle()
    })
}
</script>

<template>
  <AppMobileTable :columns="filteredColumns">
    <template #header>
      <div class="flex items-start flex-wrap gap-2 mb-6 justify-between">
        <div class="flex flex-col gap-2">
          <p class="text-white text-sm font-semibold">
            {{ $t(`portfolio.table.position.${PositionTableColumn.Market}`) }}
          </p>

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
        </div>

        <div class="flex space-x-2">
          <AppButton size="sm" class="py-2" @click="addTpSl">
            <span>
              {{ $t('trade.addTpSl') }}
            </span>
          </AppButton>

          <AppButton
            v-bind="{
              status: marketCloseStatus,
              disabled: !position.isMarketOrderAuthorized,
              tooltip: position.isMarketOrderAuthorized
                ? ''
                : $t('common.unauthorized')
            }"
            size="sm"
            :variant="lg ? 'danger-ghost' : 'primary'"
            :class="[!lg ? 'py-2' : 'min-w-20']"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OpenPosClosePosition)"
            @click="closePositionClicked"
          >
            {{ $t('trade.closePosition') }}
          </AppButton>
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

    <template #amount-data>
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

    <template #entry-or-mark-data>
      <div class="space-y-1 flex flex-col" :class="{ 'items-end': sm }">
        <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenEntryPrice)">
          <AppAmount
            v-bind="{
              amount: position.price.toFixed(),
              decimalPlaces: position.priceDecimals
            }"
          />
        </p>
        <p class="text-coolGray-500">
          <AppAmount
            v-bind="{
              amount: position.markPrice.toFixed(),
              decimalPlaces: position.priceDecimals
            }"
          />
        </p>
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
          <span>$</span>
          <AppUsdAmount
            v-bind="{
              amount: position.quantityInUsd.toFixed()
            }"
          />
        </p>
      </div>
    </template>

    <template #margin-data>
      <div class="flex items-center space-x-2 justify-end">
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
