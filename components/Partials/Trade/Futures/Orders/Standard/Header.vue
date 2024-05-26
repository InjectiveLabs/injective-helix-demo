<script setup lang="ts">
import { BaseDropdownOption } from '@injectivelabs/ui-shared'
import { PerpOrdersStandardView } from '@/types'

const props = defineProps({
  modelValue: {
    type: String as PropType<PerpOrdersStandardView>,
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: PerpOrdersStandardView]
}>()

const walletStore = useWalletStore()
const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const isMobile = useIsMobile()

const view = useVModel(props, 'modelValue', emit)

const options = computed(() => {
  const items: BaseDropdownOption[] = [
    {
      display: `activity.${PerpOrdersStandardView.OpenPositions}`,
      value: PerpOrdersStandardView.OpenPositions,
      amount: positionStore.subaccountPositionsCount
    },
    {
      display: `activity.${PerpOrdersStandardView.OpenOrders}`,
      value: PerpOrdersStandardView.OpenOrders,
      amount: derivativeStore.subaccountOrdersCount
    },
    {
      display: `activity.${PerpOrdersStandardView.Triggers}`,
      value: PerpOrdersStandardView.Triggers,
      amount: derivativeStore.subaccountConditionalOrdersCount
    },
    {
      display: `activity.${PerpOrdersStandardView.OrderHistory}`,
      value: PerpOrdersStandardView.OrderHistory,
      amount: derivativeStore.subaccountOrderHistoryCount
    },
    {
      display: `activity.${PerpOrdersStandardView.TradeHistory}`,
      value: PerpOrdersStandardView.TradeHistory,
      amount: derivativeStore.subaccountTradesCount
    }
  ]

  if (walletStore.isUserWalletConnected) {
    items.unshift({
      display: `activity.${PerpOrdersStandardView.Balances}`,
      value: PerpOrdersStandardView.Balances
    })
  }

  return items
})

watch(
  () => walletStore.isUserWalletConnected,
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
      v-if="isMobile"
      v-bind="{
        options
      }"
      v-model="view"
      class="border-r"
    >
      <template #default="{ selected }">
        <button class="px-2">
          {{ $t(`activity.${selected?.value}`) }}
          {{
            Number.isInteger(selected?.amount)
              ? `(${selected?.amount || 0})`
              : ''
          }}
        </button>
      </template>

      <template #option="{ option }">
        <button>
          {{ $t(`activity.${option.value}`) }}
          {{ Number.isInteger(option.amount) ? `(${option.amount})` : '' }}
        </button>
      </template>
    </AppTabSelect>

    <AppButtonSelect
      v-for="{ value, display, amount } in options"
      v-else
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(display) }}
      {{ Number.isInteger(amount) ? `(${amount})` : '' }}
    </AppButtonSelect>

    <div class="flex-1 hidden lg:flex items-center px-2 justify-end">
      <PartialsPortfolioOrdersFuturesOpenOrdersCancelAllOrders
        v-if="view === PerpOrdersStandardView.OpenOrders"
      />

      <PartialsPortfolioOrdersFuturesTriggersCancelAllTriggers
        v-if="view === PerpOrdersStandardView.Triggers"
      />
    </div>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
