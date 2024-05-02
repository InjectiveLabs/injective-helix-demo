<script setup lang="ts">
import { SharedUiSpotMarket } from '@shared/types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  SpotTradeForm,
  SpotTradeFormField,
  TradeTypes,
  spotMarketKey
} from '@/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

const market = inject(spotMarketKey)

const el = ref(null)

const { focused } = useFocusWithin(el)
const spotFormValues = useFormValues<SpotTradeForm>()
const setQuantityAmount = useSetFieldValue(SpotTradeFormField.Quantity)
const { accountBalancesWithToken } = useBalance()

const { lastTradedPrice } = useSpotLastPrice(
  computed(() => market?.value as SharedUiSpotMarket)
)

const isBuy = computed(() => {
  return spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
})

const {
  valueToString: quoteBalanceToString,
  valueToFixed: quoteBalanceToFixed
} = useBigNumberFormatter(
  computed(() => {
    const balance = accountBalancesWithToken.value.find(
      (balance) => balance.token.denom === market?.value?.quoteToken.denom
    )

    return new BigNumberInWei(balance?.accountTotalBalance || 0).toBase(
      balance?.token.decimals || 0
    )
  }),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { value: totalValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Total,
  initialValue: '',
  rule: '',
  dynamicRule: computed(() => {
    const rules = []

    const insufficientBalance = `insufficientSgt:${quoteBalanceToFixed.value}`

    if (isBuy.value) {
      rules.push(insufficientBalance)
    }

    return rules.join('|')
  })
})

const value = computed({
  get: () => totalValue.value,
  set: (value: string) => {
    totalValue.value = value

    // If the value is empty, set the quantity amount to empty
    if (value === '') {
      setQuantityAmount('')
      return
    }

    // If the input is focused, calculate the quantity amount

    if (focused.value) {
      if (spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Market) {
        setQuantityAmount(
          new BigNumberInBase(value)
            .div(lastTradedPrice.value)
            .toFixed(market?.value?.quantityDecimals || 0)
        )
      } else if (spotFormValues.value[SpotTradeFormField.Price]) {
        setQuantityAmount(
          new BigNumberInBase(value)
            .div(spotFormValues.value[SpotTradeFormField.Price])
            .toFixed(market?.value?.quantityDecimals || 0)
        )
      }
    }
  }
})
</script>

<template>
  <div v-if="market" ref="el" class="space-y-2">
    <p class="field-label">{{ $t('trade.total') }}</p>

    <AppInputField
      v-model="value"
      placeholder="0.00"
      v-bind="{
        decimals: market?.priceDecimals || 0
      }"
    >
      <template #left>
        <span>&thickapprox;</span>
      </template>

      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>

      <template #bottom>
        <p class="text-xs text-right text-gray-500">
          {{ $t('sgt.available') }}: {{ quoteBalanceToString }}
        </p>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
