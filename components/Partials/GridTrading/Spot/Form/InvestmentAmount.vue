<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { BigNumber, BigNumberInWei } from '@injectivelabs/utils'
import { SpotGridTradingField } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const { accountBalancesWithToken } = useBalance()

const quoteDenombalance = computed(() =>
  accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )
)

const quoteDenomAmount = computed(() =>
  new BigNumberInWei(quoteDenombalance.value?.bankBalance || 0).toBase(
    quoteDenombalance.value?.token.decimals
  )
)

const { valueToString } = useBigNumberFormatter(quoteDenomAmount, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { value: investmentAmountValue } = useStringField({
  name: SpotGridTradingField.InvestmentAmount,
  dynamicRule: computed(
    () =>
      `between:${new BigNumber(1).exponentiatedBy(
        -(quoteDenombalance.value?.token?.decimals || 6)
      )},${quoteDenomAmount.value.toFixed()}`
  )
})
</script>

<template>
  <div class="pt-4">
    <div class="flex justify-between items-center">
      <p class="text-xs font-semibold text-gray-200 mb-2">Investment Amount</p>
      <p class="text-xs font-semibold text-gray-500 mb-2">
        Available {{ valueToString }} USDT
      </p>
    </div>

    <AppInputNumeric v-model="investmentAmountValue" class="text-right" />
  </div>
</template>
