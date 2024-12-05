<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
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

const props = withDefaults(
  defineProps<{
    modelValue: SpotOrdersStandardView
    isTickerOnly?: boolean
  }>(),
  {
    isTickerOnly: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: SpotOrdersStandardView]
  'update:isTickerOnly': [value: boolean]
}>()

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const lg = breakpoints['3xl']
const xl = breakpoints['4xl']

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
  <div class="h-header border-b flex">
    <CommonSubaccountTabSelector v-bind="{ isSm: true }" />

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
      class="flex items-center text-coolGray-450 font-medium"
      :class="[xl ? 'px-3 text-sm' : 'px-2 text-xs']"
      active-classes="text-white"
    >
      {{ $t(display) }}
      {{ Number.isInteger(Number(description)) ? `(${description})` : '' }}
    </AppButtonSelect>

    <div class="flex items-center flex-1 justify-end px-2">
      <AppCheckbox2
        v-model="isTickerOnlyValue"
        is-plain
        :class="[xl ? 'text-sm' : 'text-xs']"
      >
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
