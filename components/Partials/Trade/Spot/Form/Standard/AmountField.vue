<script setup lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  TradeTypes,
  UiSpotMarket,
  spotMarketKey,
  SpotTradeForm,
  SpotTradeFormField
} from '@/types'

import {
  DEFAULT_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_DISPLAY_DECIMALS,
  ONE_IN_BASE
} from '@/app/utils/constants'

const props = defineProps({
  totalWorstPriceWithSlippageAndFees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  worstPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const market = inject(spotMarketKey)

const el = ref(null)

const { focused } = useFocusWithin(el)
const spotFormValues = useFormValues<SpotTradeForm>()
const setTotalAmount = useSetFieldValue(SpotTradeFormField.Total)
const { accountBalancesWithToken } = useBalance()

const { lastTradedPrice } = useSpotLastPrice(
  computed(() => market?.value as UiSpotMarket)
)

const isBuy = computed(() => {
  return spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
})

const isMarket = computed(() => {
  return spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Market
})

const highDeviation = computed(() => {
  if (!isMarket.value || !spotFormValues.value[SpotTradeFormField.Quantity]) {
    return false
  }

  const percentage = new BigNumberInBase(props.worstPrice).dividedBy(
    lastTradedPrice.value
  )

  return (
    percentage.gt(DEFAULT_PRICE_WARNING_DEVIATION.plus(1)) ||
    percentage.lt(ONE_IN_BASE.minus(DEFAULT_PRICE_WARNING_DEVIATION))
  )
})

const { valueToString: baseBalanceToString, valueToFixed: baseBalanceToFixed } =
  useSharedBigNumberFormatter(
    computed(() => {
      const balance = accountBalancesWithToken.value.find(
        (balance) => balance.token.denom === market?.value?.baseToken.denom
      )

      return new BigNumberInWei(balance?.accountTotalBalance || 0).toBase(
        balance?.token.decimals || 0
      )
    }),
    {
      decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
    }
  )

const { value: amountValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Quantity,
  initialValue: '',
  dynamicRule: computed(() => {
    const rules = []

    const insufficientBalance = `insufficientSgt:${baseBalanceToFixed.value}`

    if (!isBuy.value) {
      rules.push(insufficientBalance)
    }

    return rules.join('|')
  })
})

const value = computed({
  get: () => amountValue.value,
  set: (value: string) => {
    amountValue.value = value

    // If the value is empty, set the total amount to empty
    if (value === '' && focused.value) {
      setTotalAmount('')
      return
    }

    // If the input is focused, calculate the total amount
    if (focused.value) {
      if (spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Market) {
        setTotalAmount(
          lastTradedPrice.value
            .times(value)
            .toFixed(market?.value?.priceDecimals || 0)
        )
      } else if (spotFormValues.value[SpotTradeFormField.Price]) {
        setTotalAmount(
          new BigNumberInBase(spotFormValues.value[SpotTradeFormField.Price])
            .times(value)
            .toFixed(market?.value?.priceDecimals || 0)
        )
      }
    }
  }
})

// watch(
//   () => [value.value, spotFormValues.value[SpotTradeFormField.Type]],
//   ([quantity, type]) => {
//     if (type !== TradeTypes.Market) {
//       return
//     }

//     worker?.value?.postMessage({
//       type: WorkerMessageType.WorstPrice,
//       data: {
//         quantity: quantity || '',
//         baseDecimals: 1,
//         isBuy: true,
//         isSpot: true,
//         quoteDecimals: 1
//       }
//     })
//   }
// )
</script>

<template>
  <div ref="el" class="space-y-2">
    <p class="field-label">{{ $t('trade.amount') }}</p>

    <AppInputField
      v-model="value"
      placeholder="0.00"
      v-bind="{
        decimals: market?.quantityDecimals || 0
      }"
    >
      <template #right>
        <span class="text-sm">
          {{ market?.baseToken.symbol }}
        </span>
      </template>

      <template #bottom>
        <p class="text-xs text-right text-gray-500">
          {{ $t('sgt.available') }}: {{ baseBalanceToString }}
        </p>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="highDeviation" class="text-xs text-green-700 font-semibold">
      Warning: Price Deviation Above:
      {{ DEFAULT_PRICE_WARNING_DEVIATION.times(100).toFixed(2) }}%
    </div>
  </div>
</template>
