<script setup lang="ts">
import { SharedDropdownOption } from '@shared/types'
import {
  MarketKey,
  UiSpotMarket,
  SpotOrdersStandardView,
  SpotMarketCyTags
} from '@/types'

const spotStore = useSpotStore()
const isMobile = useIsMobile()
const breakpoints = useBreakpointsTw()
const sharedWalletStore = useSharedWalletStore()

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

const xxl = breakpoints['4xl']

const view = useVModel(props, 'modelValue', emit)

const isTickerOnlyValue = useVModel(props, 'isTickerOnly', emit)

const options = computed(() => {
  const items: SharedDropdownOption[] = [
    {
      display: `activity.${SpotOrdersStandardView.OpenOrders}`,
      value: SpotOrdersStandardView.OpenOrders,
      description: `${spotStore.subaccountOrdersCount}`
    },
    {
      display: `activity.${SpotOrdersStandardView.OrderHistory}`,
      value: SpotOrdersStandardView.OrderHistory,
      description: `${spotStore.subaccountOrderHistoryCount}`
    },
    {
      display: `activity.${SpotOrdersStandardView.TradeHistory}`,
      value: SpotOrdersStandardView.TradeHistory,
      description: `${spotStore.subaccountTradesCount}`
    }
  ]

  if (sharedWalletStore.isUserConnected) {
    items.unshift({
      display: `activity.${SpotOrdersStandardView.Balances}`,
      value: SpotOrdersStandardView.Balances
    })
  }

  return items
})

watch(
  () => sharedWalletStore.isUserConnected,
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
        <button
          class="px-2"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderDetailsDropDown)"
        >
          {{ $t(selected?.display || '') }}
          {{
            Number.isInteger(Number(selected?.description))
              ? `(${selected?.description || 0})`
              : ''
          }}
        </button>
      </template>

      <template #option="{ option }">
        <button
          :data-cy="`${dataCyTag(
            SpotMarketCyTags.OrderDetailsDropdownOptions
          )}-${option.display}`"
        >
          {{ $t(option.display) }}
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
