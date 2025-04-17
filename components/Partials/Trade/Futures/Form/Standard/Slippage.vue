<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_SLIPPAGE, DEFAULT_SLIPPAGE } from '@/app/utils/constants'
import { MarketKey, DerivativesTradeFormField } from '@/types'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const appStore = useAppStore()

const errors = useFormErrors<DerivativesTradeForm>()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

withDefaults(
  defineProps<{
    worstPrice: BigNumberInBase
  }>(),
  {}
)

const { value: slippageValue } = useStringField({
  name: DerivativesTradeFormField.Slippage,
  rule: 'slippage'
})

const isHighSlippage = computed(() =>
  new BigNumberInBase(slippageValue.value).gt(5)
)

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
    <div class="flex items-center gap-2">
      <p class="field-label">
        {{ $t('trade.slippage_tolerance') }}
      </p>

      <AppTooltip
        v-bind="{ content: 'Sample Description of Slippage Tolerance Tooltip' }"
      >
        <UIcon :name="NuxtUiIcons.Info3" class="size-4 text-coolGray-450" />
      </AppTooltip>
    </div>

    <div class="my-4">
      <div class="max-w-24">
        <AppInputField
          v-model="slippageValue"
          v-bind="{
            min: 0,
            max: 50,
            decimals: 2,
            noStyle: true,
            alignLeft: true,
            wrapperClass:
              'block focus-within:focus-ring transition-all duration-300 border border-[#181E31] rounded-md bg-brand-875 text-sm pl-2 pr-4 font-mono'
          }"
          @update:model-value="onSlippageChange"
        >
          <template #right>%</template>
        </AppInputField>
      </div>

      <p v-if="errors?.slippage" class="text-red-500 text-xs mt-1.5">
        {{ errors.slippage }}
      </p>

      <p v-else-if="isHighSlippage" class="text-orange-500 text-xs mt-1.5">
        {{ $t('trade.slippageWarnings.tooHigh') }}
      </p>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <p class="field-label !text-coolGray-450">
          {{ $t('trade.worstPrice') }}
        </p>

        <AppTooltip
          v-bind="{ content: 'Sample Description of Worst Price Tooltip' }"
        >
          <UIcon :name="NuxtUiIcons.Info3" class="size-4 text-coolGray-450" />
        </AppTooltip>
      </div>

      <p class="flex gap-2 text-xs">
        <AppAmount
          v-bind="{
            amount: worstPrice.toFixed(),
            decimalPlaces: derivativeMarket.priceDecimals
          }"
          class="font-mono"
        />
        <span class="text-coolGray-450">
          {{ derivativeMarket.quoteToken.symbol }}
        </span>
      </p>
    </div>
  </div>
</template>
