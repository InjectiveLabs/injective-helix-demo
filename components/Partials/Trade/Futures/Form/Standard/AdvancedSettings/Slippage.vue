<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_SLIPPAGE, DEFAULT_SLIPPAGE } from '@/app/utils/constants'
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativesTradeFormField,
  DerivativesTradeForm
} from '@/types'

const appStore = useAppStore()

const errors = useFormErrors<DerivativesTradeForm>()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const { value: slippageValue } = useStringField({
  name: DerivativesTradeFormField.Slippage,
  rule: 'slippage'
})

function onSlippageChange(value: string) {
  const slippageInBigNumber = new BigNumberInBase(value)

  const slippage =
    slippageInBigNumber.gt(MAX_SLIPPAGE) ||
    slippageInBigNumber.lt(DEFAULT_SLIPPAGE)
      ? DEFAULT_SLIPPAGE.toFixed()
      : value

  appStore.setUserState({
    ...appStore.userState,
    marketSlippageIdMap: {
      ...appStore.userState.marketSlippageIdMap,
      [derivativeMarket.value.marketId]: slippage
    }
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <p class="text-white text-xs pl-2 tracking-wide">
        {{ $t('trade.slippage') }}
      </p>

      <AppInputField
        v-bind="{ decimals: 2, max: 50, min: 0 }"
        v-model="slippageValue"
        no-style
        wrapper-class="border text-xs min-w-0 basis-24 px-2 rounded mb-1 text-white"
        @update:model-value="onSlippageChange"
      >
        <template #right>%</template>
      </AppInputField>
    </div>

    <p v-if="errors?.slippage" class="text-orange-500 text-xs mt-1">
      {{ errors.slippage }}
    </p>
  </div>
</template>
