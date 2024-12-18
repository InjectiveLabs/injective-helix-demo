<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativeGridTradingForm,
  DerivativeGridTradingField
} from '@/types'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE_LOW
} from '@/app/utils/constants'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const sharedWalletStore = useSharedWalletStore()
const { subaccountPortfolioBalanceMap } = useBalance()
const derivativeGridFormValues = useFormValues<DerivativeGridTradingForm>()

withDefaults(
  defineProps<{
    isAuto?: boolean
    isDisabled?: boolean
  }>(),
  {
    isAuto: false,
    isDisabled: false
  }
)

const accountBalance = computed(
  () =>
    subaccountPortfolioBalanceMap.value[
      sharedWalletStore.authZOrDefaultSubaccountId
    ]
)

const quoteDenomBalance = computed(
  () =>
    accountBalance.value?.find(
      (balance) => balance.denom === market.value.quoteDenom
    )
)

const gridThreshold = computed(() => {
  const isGridHigherThanGridThreshold =
    !!derivativeGridFormValues.value[DerivativeGridTradingField.Grids] &&
    Number(derivativeGridFormValues.value[DerivativeGridTradingField.Grids]) >=
      GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(derivativeGridFormValues.value[DerivativeGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(GST_MIN_TRADING_SIZE_LOW)
})

const {
  valueToBigNumber: quoteDenomAmount,
  valueToString: quoteDenomAmountToString
} = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: quoteDenomBalance.value?.availableBalance || 0,
      decimalPlaces: quoteDenomBalance.value?.token.decimals
    })
  )
)

const { value: marginAmount, errorMessage: marginAmountError } = useStringField(
  {
    name: DerivativeGridTradingField.Margin,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const insufficientRule = `insufficientSgt:${quoteDenomAmount.value.toFixed()}`

      const minValueRule = `minValueSgt:${gridThreshold.value.toFixed()}`

      const rules = [insufficientRule, minValueRule]

      return rules.join('|')
    })
  }
)
</script>

<template>
  <div v-if="market" class="space-y-4">
    <div class="flex justify-between items-center">
      <CommonHeaderTooltip
        v-bind="{ tooltip: $t('sgt.investmentTooltip') }"
        :popper="{
          placement: 'top',
          strategy: 'fixed',
          offsetDistance: -40
        }"
      >
        <span v-if="!isAuto" class="text-white font-semibold text-xs">
          3.
        </span>
        <span class="text-white font-semibold text-xs">
          {{ $t('sgt.amount') }}
        </span>
      </CommonHeaderTooltip>

      <div
        class="flex p-2 items-center space-x-2 text-xs bg-brand-875 rounded-md"
      >
        <CommonTokenIcon is-sm v-bind="{ token: market.baseToken }" />
        <p>{{ market.baseToken.symbol }}</p>
        <span>+</span>
        <CommonTokenIcon is-sm v-bind="{ token: market.quoteToken }" />
        <p>{{ market.quoteToken.symbol }}</p>
      </div>
    </div>

    <AppInputField
      v-model="marginAmount"
      placeholder="0.00"
      :disabled="isDisabled"
    >
      <template #right>
        <span>{{ market.quoteToken.symbol }}</span>
      </template>

      <template #bottom>
        <div class="text-right text-xs text-coolGray-500">
          {{ $t('sgt.available') }}: {{ quoteDenomAmountToString }}
        </div>
      </template>
    </AppInputField>

    <p v-if="marginAmountError" class="error-message">
      {{ marginAmountError }}
    </p>
  </div>
</template>
