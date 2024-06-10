<script setup lang="ts">
import { BaseDropdownOption } from '@injectivelabs/ui-shared'
import { MarketKey, UiSpotMarket, SpotOrdersStandardView } from '@/types'

const props = defineProps({
  modelValue: {
    type: String as PropType<SpotOrdersStandardView>,
    required: true
  },

  isTickerOnly: {
    type: Boolean as PropType<boolean>,
    default: false
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: SpotOrdersStandardView]
  'update:isTickerOnly': [value: boolean]
}>()

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const walletStore = useWalletStore()
const spotStore = useSpotStore()
const isMobile = useIsMobile()
const breakpoints = useBreakpointsTw()

const xxl = breakpoints['4xl']

const view = useVModel(props, 'modelValue', emit)

const isTickerOnlyValue = useVModel(props, 'isTickerOnly', emit)

const options = computed(() => {
  const items: BaseDropdownOption[] = [
    {
      display: `activity.${SpotOrdersStandardView.OpenOrders}`,
      value: SpotOrdersStandardView.OpenOrders,
      amount: spotStore.subaccountOrdersCount
    },
    {
      display: `activity.${SpotOrdersStandardView.OrderHistory}`,
      value: SpotOrdersStandardView.OrderHistory,
      amount: spotStore.subaccountOrderHistoryCount
    },
    {
      display: `activity.${SpotOrdersStandardView.TradeHistory}`,
      value: SpotOrdersStandardView.TradeHistory,
      amount: spotStore.subaccountTradesCount
    }
  ]

  if (walletStore.isUserWalletConnected) {
    items.unshift({
      display: `activity.${SpotOrdersStandardView.Balances}`,
      value: SpotOrdersStandardView.Balances
    })
  }

  return items
})

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected) => {
    if (!isConnected && view.value === SpotOrdersStandardView.Balances) {
      view.value = SpotOrdersStandardView.OpenOrders
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
        <button class="px-2">
          {{ $t(selected?.display || '') }}
          {{ selected?.amount ? `(${selected.amount})` : '' }}
        </button>
      </template>

      <template #option="{ option }">
        <button>
          {{ $t(option.display) }}
          {{ option.amount ? `(${option.amount})` : '' }}
        </button>
      </template>
    </AppTabSelect>

    <AppButtonSelect
      v-for="{ value, amount, display } in options"
      v-else
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(display) }} {{ Number.isInteger(amount) ? `(${amount})` : '' }}
    </AppButtonSelect>

    <div class="flex items-center flex-1 justify-end px-2">
      <AppCheckbox2 v-model="isTickerOnlyValue">
        <span>
          {{ $t('trade.tickerOnly', { ticker: spotMarket.ticker }) }}
        </span>
      </AppCheckbox2>

      <PartialsPortfolioOrdersSpotOpenOrdersCancelAllOrders
        v-if="view === SpotOrdersStandardView.OpenOrders && !isMobile"
        v-bind="{ isTickerOnly }"
      />
    </div>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
