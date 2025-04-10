<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_SLIPPAGE, DEFAULT_SLIPPAGE } from '@/app/utils/constants'
import { MarketKey, SpotMarketCyTags, SpotTradeFormField } from '@/types'
import type { UiSpotMarket, SpotTradeForm } from '@/types'

const appStore = useAppStore()

const errors = useFormErrors<SpotTradeForm>()

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const { value: slippageValue } = useStringField({
  rule: 'slippage',
  name: SpotTradeFormField.Slippage
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
      [spotMarket.value.marketId]: slippage
    }
  })
}
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between"
      :data-cy="dataCyTag(SpotMarketCyTags.AdvancedSettingsSlippage)"
    >
      <p class="text-white text-xs pl-2 tracking-wide">
        {{ $t('trade.slippage') }}
      </p>

      <AppInputField
        v-bind="{ decimals: 2, max: 100, min: 0 }"
        v-model="slippageValue"
        no-style
        wrapper-class="border text-xs min-w-0 basis-24 px-2 rounded text-white"
        @update:model-value="onSlippageChange"
      >
        <template #right>%</template>
      </AppInputField>
    </div>

    <p v-if="errors?.slippage" class="text-red-500 text-xs mt-1">
      {{ errors.slippage }}
    </p>

    <p v-else-if="isHighSlippage" class="text-orange-500 text-xs mt-1">
      {{ $t('trade.slippageWarnings.tooHigh') }}
    </p>
  </div>
</template>
