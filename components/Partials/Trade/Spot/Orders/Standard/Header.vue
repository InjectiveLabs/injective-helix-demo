<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { MarketKey, SpotMarketCyTags, SpotOrdersStandardView } from '@/types'
import type { UiSpotMarket } from '@/types'
import type { SharedDropdownOption } from '@shared/types'

const isMobile = useIsMobile()
const spotStore = useSpotStore()
const breakpoints = useSharedBreakpoints()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    isTickerOnly?: boolean
    modelValue: SpotOrdersStandardView
  }>(),
  {}
)

const emit = defineEmits<{
  'update:isTickerOnly': [value: boolean]
  'update:modelValue': [value: SpotOrdersStandardView]
}>()

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const lg = breakpoints['3xl']
const xl = breakpoints['5xl']

const view = useVModel(props, 'modelValue', emit)
const isTickerOnlyValue = useVModel(props, 'isTickerOnly', emit)

const options = computed(() => {
  const items: SharedDropdownOption[] = [
    {
      display: `trade.tab.${SpotOrdersStandardView.Orders}`,
      value: SpotOrdersStandardView.Orders,
      description: `${spotStore.subaccountOrdersCount}`
    },
    {
      display: `trade.tab.${SpotOrdersStandardView.OrderHistory}`,
      value: SpotOrdersStandardView.OrderHistory,
      description: `${spotStore.subaccountOrderHistoryCount}`
    },
    {
      display: `trade.tab.${SpotOrdersStandardView.TradeHistory}`,
      value: SpotOrdersStandardView.TradeHistory,
      description: `${spotStore.subaccountTradesCount}`
    }
  ]

  if (sharedWalletStore.isUserConnected) {
    items.unshift({
      display: `trade.tab.${SpotOrdersStandardView.Balances}`,
      value: SpotOrdersStandardView.Balances
    })
  }

  return items
})

watch(
  () => sharedWalletStore.isUserConnected,
  (isConnected) => {
    if (!isConnected && view.value === SpotOrdersStandardView.Balances) {
      view.value = SpotOrdersStandardView.Orders
    }
  }
)
</script>

<template>
  <div class="h-header border-b flex sticky top-0 bg-coolGray-975 z-10">
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
      :data-cy="`${dataCyTag(SpotMarketCyTags.OrderDetails)}-${value}`"
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

    <div class="flex items-center flex-1 justify-end px-2">
      <AppCheckbox
        v-if="view !== SpotOrdersStandardView.Balances"
        v-model="isTickerOnlyValue"
        is-plain
        :class="[xl ? 'text-sm' : 'text-xs']"
      >
        <span>
          {{ $t('trade.tickerOnly', { ticker: spotMarket.ticker }) }}
        </span>
      </AppCheckbox>

      <PartialsPortfolioOrdersSpotOpenOrdersCancelAllOrders
        v-if="view === SpotOrdersStandardView.Orders && !isMobile"
        v-bind="{ isTickerOnly }"
      />
    </div>
  </div>
</template>
