<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SharedDropdownOption } from '@shared/types'
import {
  MarketKey,
  UiDerivativeMarket,
  PerpetualMarketCyTags,
  PerpOrdersStandardView
} from '@/types'

const breakpoints = useBreakpointsTw()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    isTickerOnly?: boolean
    modelValue: PerpOrdersStandardView
  }>(),
  {}
)

const emit = defineEmits<{
  'update:isTickerOnly': [value: boolean]
  'update:modelValue': [value: PerpOrdersStandardView]
}>()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const lg = breakpoints['3xl']
const xl = breakpoints['5xl']

const view = useVModel(props, 'modelValue', emit)
const isTickerOnlyValue = useVModel(props, 'isTickerOnly', emit)

const options = computed(() => {
  const items: SharedDropdownOption[] = [
    {
      value: PerpOrdersStandardView.Positions,
      description: `${positionStore.subaccountPositions.length}`,
      display: `activity.${PerpOrdersStandardView.Positions}`
    },
    {
      value: PerpOrdersStandardView.Orders,
      description: `${derivativeStore.subaccountOrdersCount}`,
      display: `activity.${PerpOrdersStandardView.Orders}`
    },
    {
      value: PerpOrdersStandardView.AdvancedOrders,
      display: `activity.${PerpOrdersStandardView.AdvancedOrders}`,
      description: `${derivativeStore.subaccountConditionalOrdersCount}`
    },
    {
      value: PerpOrdersStandardView.OrderHistory,
      display: `activity.${PerpOrdersStandardView.OrderHistory}`,
      description: `${derivativeStore.subaccountOrderHistoryCount}`
    },
    {
      value: PerpOrdersStandardView.TradeHistory,
      description: `${derivativeStore.subaccountTradesCount}`,
      display: `activity.${PerpOrdersStandardView.TradeHistory}`
    },
    {
      value: PerpOrdersStandardView.FundingHistory,
      display: `activity.${PerpOrdersStandardView.FundingHistory}`
    }
  ]

  if (sharedWalletStore.isUserConnected) {
    items.unshift({
      value: PerpOrdersStandardView.Balances,
      display: `activity.${PerpOrdersStandardView.Balances}`
    })
  }

  return items
})

watch(
  () => sharedWalletStore.isUserConnected,
  (isConnected) => {
    if (!isConnected && view.value === PerpOrdersStandardView.Balances) {
      view.value = PerpOrdersStandardView.Orders
    }
  }
)
</script>

<template>
  <div class="h-header border-b-2 flex sticky top-0 bg-coolGray-975 z-10">
    <CommonSubaccountTabSelector
      v-bind="{
        isSm: true
      }"
    />

    <AppTabSelect
      v-if="!lg"
      v-bind="{
        options
      }"
      v-model="view"
      class="border-r"
    >
      <template #default="{ selected }">
        <button
          class="px-2"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderDetailsDropdown)"
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
          :data-cy="`${PerpetualMarketCyTags.OrderDetailsDropdownOptions}-${option.value}`"
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
      class="flex items-center text-coolGray-450 font-medium"
      :class="[xl ? 'px-3 text-xs' : 'px-2 text-xs']"
      active-classes="text-white"
    >
      {{ $t(display) }}
      {{
        Number.isInteger(Number(description)) && Number(description) > 0
          ? `(${description})`
          : ''
      }}
    </AppButtonSelect>

    <div class="hidden sm:flex flex-1 items-center px-2 justify-end">
      <AppCheckbox2
        v-if="view !== PerpOrdersStandardView.Balances"
        v-model="isTickerOnlyValue"
        is-plain
        class="3xl:hidden 5xl:block"
        :class="[xl ? 'text-sm' : 'text-xs']"
      >
        <span class="3xl:hidden 4xl:block">
          {{ $t('trade.tickerOnly', { ticker: derivativeMarket.ticker }) }}
        </span>
        <span class="hidden 3xl:block 4xl:hidden">
          {{ derivativeMarket.ticker }}
        </span>
      </AppCheckbox2>

      <PartialsPortfolioOrdersFuturesOpenOrdersCancelAllOrders
        v-if="view === PerpOrdersStandardView.Orders"
      />

      <PartialsPortfolioOrdersFuturesAdvancedOrdersCancelAllAdvancedOrders
        v-if="view === PerpOrdersStandardView.AdvancedOrders"
      />
    </div>
  </div>
</template>
