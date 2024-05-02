<script lang="ts" setup>
import { TokenStatic } from '@injectivelabs/token-metadata'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/sdk-ts'
import {
  BusEvents,
  ActivityForm,
  ActivityField,
  ActivitySubPage,
  UiMarketWithToken,
  ConditionalOrderType
} from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const resetForm = useResetForm<ActivityForm>()
const { t } = useLang()

const routeName = computed(() => route.name as string)

const { value: denom } = useStringField({
  name: ActivityField.Denom,
  rule: ''
})
const { value: side } = useStringField({ name: ActivityField.Side, rule: '' })
const { value: type } = useStringField({ name: ActivityField.Type, rule: '' })

const hasActiveFilters = computed(
  () => !!denom.value || !!side.value || !!type.value
)

const isSpot = computed(
  () =>
    routeName.value.startsWith(ActivitySubPage.Spot) ||
    routeName.value.startsWith(ActivitySubPage.WalletHistory)
)

const markets = computed<UiMarketWithToken[]>(() =>
  isSpot.value ? spotStore.markets : derivativeStore.markets
)

const tokens = computed(() => {
  if (!markets.value) {
    return []
  }

  const tokens = markets.value.reduce((tokens, market) => {
    return [...tokens, market.baseToken, market.quoteToken]
  }, [] as TokenStatic[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const showTypeField = computed(() => {
  return [
    ActivitySubPage.SpotOrderHistory,
    ActivitySubPage.SpotTradeHistory,
    ActivitySubPage.DerivativesTriggers,
    ActivitySubPage.DerivativesOrderHistory,
    ActivitySubPage.DerivativesTradeHistory
  ].includes(route.name as ActivitySubPage)
})

const showSideField = computed(
  () =>
    !routeName.value.includes(ActivitySubPage.WalletHistory) &&
    !routeName.value.includes(ActivitySubPage.SpotSwapHistory) &&
    !routeName.value.includes(ActivitySubPage.PositionsFundingPayments)
)

const sideOptions = computed(() => {
  if (routeName.value.startsWith(ActivitySubPage.Positions)) {
    return [
      {
        display: t('trade.long'),
        value: TradeDirection.Long
      },
      {
        display: t('trade.short'),
        value: TradeDirection.Short
      }
    ]
  }

  return [
    {
      display: t('trade.buy'),
      value: TradeDirection.Buy
    },
    {
      display: t('trade.sell'),
      value: TradeDirection.Sell
    }
  ]
})

const typeOptions = computed(() => {
  let result = [
    {
      display: t('trade.limit'),
      value: `${TradeExecutionType.LimitFill}`
    },
    {
      display: t('trade.market'),
      value: `${TradeExecutionType.Market}`
    }
  ]

  if (routeName.value.startsWith(ActivitySubPage.Spot)) {
    return result
  }

  const derivativeTypes = [
    {
      display: `${t('trade.stopLoss')} ${t('trade.limit')}`,
      value: `${TradeExecutionType.LimitFill}-${ConditionalOrderType.StopLoss}`
    },
    {
      display: `${t('trade.stopLoss')} ${t('trade.market')}`,
      value: `${TradeExecutionType.Market}-${ConditionalOrderType.StopLoss}`
    },
    {
      display: `${t('trade.takeProfit')} ${t('trade.limit')}`,
      value: `${TradeExecutionType.LimitFill}-${ConditionalOrderType.TakeProfit}`
    },
    {
      display: `${t('trade.takeProfit')} ${t('trade.market')}`,
      value: `${TradeExecutionType.Market}-${ConditionalOrderType.TakeProfit}`
    }
  ]

  if (routeName.value.includes(ActivitySubPage.DerivativesTriggers)) {
    return derivativeTypes
  }

  if (
    routeName.value.includes(ActivitySubPage.DerivativesOrderHistory) ||
    routeName.value.includes(ActivitySubPage.DerivativesTradeHistory)
  ) {
    result = [...result, ...derivativeTypes]
  }

  return result
})

function onClearFilters() {
  resetForm()
  useEventBus<string>(BusEvents.ActivityFilterUpdate).emit()
}

function onUpdate() {
  useEventBus<string>(BusEvents.ActivityFilterUpdate).emit()
}
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
    <div class="grid grid-cols-4 items-center gap-4 w-full">
      <PartialsActivityCommonMarketFilter
        v-if="!routeName.includes(ActivitySubPage.SpotSwapHistory)"
        v-model="denom"
        class="col-span-2 sm:col-span-1"
        :tokens="tokens"
        @update:model-value="onUpdate"
      />

      <AppSelectField
        v-if="showTypeField"
        v-model="type"
        class="col-span-2 sm:col-span-1"
        :options="typeOptions"
        :placeholder="$t('activity.common.type')"
        is-clearable
        data-cy="universal-table-filter-by-type-drop-down"
        @update:model-value="onUpdate"
      />

      <AppSelectField
        v-if="showSideField"
        v-model="side"
        class="col-span-2 sm:col-span-1"
        :options="sideOptions"
        :placeholder="$t('trade.side')"
        is-clearable
        data-cy="universal-table-filter-by-asset-input"
        @update:model-value="onUpdate"
      />

      <div
        class="flex items-center justify-between gap-1 text-sm col-span-4 sm:col-span-1"
        :class="{ 'justify-self-end': !hasActiveFilters }"
      >
        <AppButton
          v-if="hasActiveFilters"
          class="border-gray-500 text-gray-500 px-3"
          is-sm
          @click="onClearFilters"
        >
          <div class="items-center flex gap-1">
            <BaseIcon name="close" is-md />
            <span>{{ $t('filters.clearAll') }}</span>
          </div>
        </AppButton>

        <PartialsActivityRefreshButton @click="onClearFilters" />
      </div>
    </div>

    <div id="activity-toolbar-action" />
  </div>
</template>
