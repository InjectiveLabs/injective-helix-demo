<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SharedDropdownOption } from '@shared/types'
import {
  MarketKey,
  UiDerivativeMarket,
  PerpOrdersStandardView,
  PerpetualmarketCyTags
} from '@/types'

const breakpoints = useBreakpointsTw()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    modelValue: PerpOrdersStandardView
    isTickerOnly: boolean
  }>(),
  {
    isTickerOnly: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: PerpOrdersStandardView]
  'update:isTickerOnly': [value: boolean]
}>()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const xxl = breakpoints['4xl']

const view = useVModel(props, 'modelValue', emit)

const isTickerOnlyValue = useVModel(props, 'isTickerOnly', emit)

const options = computed(() => {
  const items: SharedDropdownOption[] = [
    {
      display: `activity.${PerpOrdersStandardView.OpenPositions}`,
      value: PerpOrdersStandardView.OpenPositions,
      description: `${positionStore.subaccountPositionsCount}`
    },
    {
      display: `activity.${PerpOrdersStandardView.OpenOrders}`,
      value: PerpOrdersStandardView.OpenOrders,
      description: `${derivativeStore.subaccountOrdersCount}`
    },
    {
      display: `activity.${PerpOrdersStandardView.Triggers}`,
      value: PerpOrdersStandardView.Triggers,
      description: `${derivativeStore.subaccountConditionalOrdersCount}`
    },
    {
      display: `activity.${PerpOrdersStandardView.OrderHistory}`,
      value: PerpOrdersStandardView.OrderHistory,
      description: `${derivativeStore.subaccountOrderHistoryCount}`
    },
    {
      display: `activity.${PerpOrdersStandardView.TradeHistory}`,
      value: PerpOrdersStandardView.TradeHistory,
      description: `${derivativeStore.subaccountTradesCount}`
    }
  ]

  if (sharedWalletStore.isUserConnected) {
    items.unshift({
      display: `activity.${PerpOrdersStandardView.Balances}`,
      value: PerpOrdersStandardView.Balances
    })
  }

  return items
})

watch(
  () => sharedWalletStore.isUserConnected,
  (isConnected) => {
    if (!isConnected && view.value === PerpOrdersStandardView.Balances) {
      view.value = PerpOrdersStandardView.OpenOrders
    }
  }
)
</script>

<template>
  <div class="h-header border-b flex divide-x">
    <CommonSubaccountTabSelector />

    <AppTabSelect
      v-if="!xxl"
      v-bind="{
        options
      }"
      v-model="view"
      class="border-r"
    >
      <template #default="{ selected }">
        <button
          class="px-2"
          :data-cy="dataCyTag(PerpetualmarketCyTags.OrderDetailsDropdown)"
        >
          {{ $t(`activity.${selected?.value}`) }}
          {{
            Number.isInteger(Number(selected?.description))
              ? `(${selected?.description || 0})`
              : ''
          }}
        </button>
      </template>

      <template #option="{ option }">
        <button
          :data-cy="`${PerpetualmarketCyTags.OrderDetailsDropdownOptions}-${option.value}`"
        >
          {{ $t(`activity.${option.value}`) }}
          {{
            Number.isInteger(Number(option.description))
              ? `(${option.description})`
              : ''
          }}
        </button>
      </template>
    </AppTabSelect>

    <AppButtonSelect
      v-for="{ value, display, description } in options"
      v-else
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(display) }}
      {{ Number.isInteger(Number(description)) ? `(${description})` : '' }}
    </AppButtonSelect>

    <div class="flex-1 flex items-center px-2 justify-end">
      <AppCheckbox2 v-model="isTickerOnlyValue">
        {{ $t('trade.tickerOnly', { ticker: derivativeMarket.ticker }) }}
      </AppCheckbox2>

      <PartialsPortfolioOrdersFuturesOpenOrdersCancelAllOrders
        v-if="view === PerpOrdersStandardView.OpenOrders"
      />

      <PartialsPortfolioOrdersFuturesTriggersCancelAllTriggers
        v-if="view === PerpOrdersStandardView.Triggers"
      />
    </div>
  </div>
</template>
