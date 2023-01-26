<script lang="ts" setup>
import { ActivityView } from '@/types'

const props = defineProps({
  denom: {
    type: String,
    default: ''
  },

  side: {
    type: String,
    default: ''
  },

  type: {
    type: String,
    default: ''
  },

  view: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:side', state: string): void
  (e: 'update:type', state: string): void
  (e: 'update:denom', state: string): void
  (e: 'update:view', state: string): void
}>()

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()

const isSpot = computed(() => {
  return (
    props.view === ActivityView.SpotOrders ||
    props.view === ActivityView.SpotTriggers ||
    props.view === ActivityView.SpotOrderHistory ||
    props.view === ActivityView.SpotTradeHistory
  )
})

const side = computed({
  get(): string {
    return props.side
  },
  set(value: string) {
    emit('update:side', value)
  }
})

const type = computed({
  get(): string {
    return props.type
  },
  set(value: string) {
    emit('update:type', value)
  }
})

const denom = computed({
  get(): string {
    return props.denom
  },

  set(value: string) {
    emit('update:denom', value)
  }
})

const view = computed({
  get(): string {
    return props.view
  },
  set(value: string) {
    emit('update:view', value)
  }
})

const markets = computed(() =>
  isSpot.value ? spotStore.markets : derivativeStore.markets
)

const showClearFiltersButton = computed(() => {
  return !!denom.value || !!side.value || !!type.value
})

const showSideFilter = computed(() => {
  return (
    view.value !== ActivityView.FundingPayments &&
    view.value !== ActivityView.WalletTransfers &&
    view.value !== ActivityView.WalletDeposits &&
    view.value !== ActivityView.WalletWithdrawals
  )
})

const showTypeFilter = computed(() => {
  return (
    view.value === ActivityView.SpotTriggers ||
    view.value === ActivityView.SpotOrderHistory ||
    view.value === ActivityView.SpotTradeHistory ||
    view.value === ActivityView.DerivativeTriggers ||
    view.value === ActivityView.DerivativeOrderHistory ||
    view.value === ActivityView.DerivativeTradeHistory
  )
})

const sideOptions = computed(() => {
  if (view.value === ActivityView.Positions) {
    return [
      {
        display: t('trade.long'),
        value: 'long'
      },
      {
        display: t('trade.short'),
        value: 'short'
      }
    ]
  }

  return [
    {
      display: t('trade.buy'),
      value: 'buy'
    },
    {
      display: t('trade.sell'),
      value: 'sell'
    }
  ]
})

const typeOptions = computed(() => {
  let result = [
    {
      display: t('trade.limit'),
      value: `limit`
    },
    {
      display: t('trade.market'),
      value: `market`
    }
  ]

  if (
    view.value !== ActivityView.SpotOrderHistory &&
    view.value !== ActivityView.SpotTradeHistory &&
    view.value !== ActivityView.DerivativeTradeHistory
  ) {
    result = [
      ...result,
      {
        display: `${t('trade.stopLoss')} ${t('trade.limit')}`,
        value: `limit-stop_loss`
      },
      {
        display: `${t('trade.stopLoss')} ${t('trade.market')}`,
        value: `market-stop_loss`
      },
      {
        display: `${t('trade.takeProfit')} ${t('trade.limit')}`,
        value: `limit-take_profit`
      },
      {
        display: `${t('trade.takeProfit')} ${t('trade.market')}`,
        value: `market-take_profit`
      }
    ]
  }

  return result
})

function handleClearFilters() {
  denom.value = ''
  side.value = ''
  type.value = ''
}
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
    <div class="grid grid-cols-4 items-center gap-4 w-full">
      <PartialsActivityCommonSearch
        v-model="denom"
        class="col-span-2 sm:col-span-1"
        :markets="markets"
        :view="view"
      />

      <AppSelectField
        v-if="showTypeFilter"
        v-model="type"
        :options="typeOptions"
        :placeholder="'Type'"
        class="col-span-2 sm:col-span-1"
        clearable
        data-cy="universal-table-filter-by-type-drop-down"
      />

      <AppSelectField
        v-if="showSideFilter"
        v-model="side"
        :options="sideOptions"
        :placeholder="$t('trade.side')"
        class="col-span-2 sm:col-span-1"
        clearable
        data-cy="universal-table-filter-by-asset-input"
      />

      <PartialsActivityCommonClearFiltersButton
        v-if="showClearFiltersButton"
        @clear="handleClearFilters"
      />
    </div>

    <PartialsActivityViewsPositionsActions
      v-if="view === ActivityView.Positions"
    />
    <PartialsActivityViewsSpotActions v-if="view === ActivityView.SpotOrders" />
    <PartialsActivityViewsDerivativesActions
      v-if="
        view === ActivityView.DerivativeOrders ||
        view === ActivityView.DerivativeTriggers
      "
      :view="view"
    />
  </div>
</template>
