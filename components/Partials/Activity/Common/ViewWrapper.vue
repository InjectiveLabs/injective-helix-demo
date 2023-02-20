<script lang="ts" setup>
import { PropType } from 'vue'
import { Token } from '@injectivelabs/token-metadata'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  ActivityTab,
  ActivityForm,
  ActivityView,
  ActivityField,
  UiMarketWithToken
} from '@/types'
import {
  executionOrderTypeToOrderTypes,
  executionOrderTypeToOrderExecutionTypes,
  executionOrderTypeToTradeExecutionTypes
} from '@/app/client/utils/activity'
import { getDenomsFromToken } from '@/app/data/token'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const formValues = useFormValues<ActivityForm>()

const props = defineProps({
  tab: {
    type: String as PropType<ActivityTab>,
    required: true
  },

  view: {
    type: String as PropType<ActivityView>,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})

const markets = computed<UiMarketWithToken[]>(() =>
  [ActivityTab.Spot, ActivityTab.WalletHistory].includes(props.tab)
    ? spotStore.markets
    : derivativeStore.markets
)

const hasActiveFilters = computed(
  () =>
    !!formValues.value[ActivityField.Denom] ||
    !!formValues.value[ActivityField.Side] ||
    !!formValues.value[ActivityField.Type]
)

const tokens = computed(() => {
  if (!markets.value) {
    return []
  }

  const tokens = markets.value.reduce((tokens, market) => {
    return [...tokens, market.baseToken, market.quoteToken]
  }, [] as Token[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const selectedToken = computed(() => {
  if (!formValues.value[ActivityField.Denom]) {
    return undefined
  }

  return tokens.value.find(
    (token) => token.denom === formValues.value[ActivityField.Denom]
  )
})

const selectedDenoms = computed(() => {
  if (!selectedToken.value) {
    return []
  }

  return getDenomsFromToken(selectedToken.value)
})

const selectedSymbol = computed(() => {
  if (!selectedToken.value) {
    return ''
  }

  return selectedToken.value.symbol
})

const marketIds = computed(() => {
  if (!selectedDenoms.value.length) {
    return undefined
  }

  return markets.value
    .filter(({ baseToken, quoteToken }) =>
      selectedDenoms.value.some((denom) =>
        [baseToken.denom, quoteToken.denom].includes(denom)
      )
    )
    .map(({ marketId }) => marketId)
})

const filterParams = computed(() => {
  const defaultFilterParams = {
    marketIds: marketIds.value
  }

  if (!hasActiveFilters.value) {
    return undefined
  }

  switch (props.view) {
    case ActivityView.FundingPayments:
      return defaultFilterParams
    case ActivityView.DerivativeOrderHistory:
    case ActivityView.SpotOrderHistory:
      return {
        ...defaultFilterParams,
        orderTypes: executionOrderTypeToOrderTypes(
          formValues.value[ActivityField.Type]
        ),
        executionTypes: executionOrderTypeToOrderExecutionTypes(
          formValues.value[ActivityField.Type]
        ),
        direction: formValues.value[ActivityField.Side]
      }
    case ActivityView.DerivativeTradeHistory:
    case ActivityView.SpotTradeHistory:
      return {
        ...defaultFilterParams,
        orderTypes: executionOrderTypeToOrderTypes(
          formValues.value[ActivityField.Type]
        ),
        executionTypes: executionOrderTypeToTradeExecutionTypes(
          formValues.value[ActivityField.Type]
        ),
        direction: formValues.value[ActivityField.Side]
      }
    case ActivityView.WalletTransfers:
      // todo: support multiple denoms filtering when indexer is ready
      return {
        denom: formValues.value[ActivityField.Denom]
      }
    default:
      return {}
  }
})

defineExpose({
  filterParams
})
</script>

<template>
  <PartialsActivityCommonToolbar
    :tab="tab"
    :view="view"
    :status="status"
    v-bind="$attrs"
  />

  <PartialsActivityView
    v-bind="{
      view,
      status,
      symbol: selectedSymbol,
      denoms: selectedDenoms,
      type: formValues[ActivityField.Type],
      side: formValues[ActivityField.Side]
    }"
    :key="view"
    class="h-full"
  />
</template>
