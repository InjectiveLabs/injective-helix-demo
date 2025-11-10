<script setup lang="ts">
import {
  UI_ZERO_DECIMAL,
  MIN_EST_SLIPPAGE,
  DEFAULT_EST_SLIPPAGE,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_PERCENTAGE_DECIMALS } from '@shared/utils/constant'
import { IsSpotKey, SpotMarketCyTags, PerpetualMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    formAmount: string
    showEstSlippage?: boolean
    slippagePercentage: string
    estSlippagePercentage: BigNumberInBase
  }>(),
  {
    showEstSlippage: true
  }
)

const emit = defineEmits<{ 'on:click': [] }>()

const isSpot = inject(IsSpotKey)

const estSlippageDecimals = computed(() => {
  if (props.formAmount === '0') {
    return UI_ZERO_DECIMAL
  }

  return UI_DEFAULT_DISPLAY_DECIMALS
})

const adaptedEstSlippagePercentage = computed(() => {
  if (props.formAmount === '0') {
    return DEFAULT_EST_SLIPPAGE
  }

  if (props.estSlippagePercentage.lt(MIN_EST_SLIPPAGE)) {
    return MIN_EST_SLIPPAGE
  }

  return props.estSlippagePercentage
})

function handleClick() {
  emit('on:click')
}
</script>

<template>
  <UPopover mode="hover" :popper="{ placement: 'top', strategy: 'fixed' }">
    <p class="text-blue-550 cursor-pointer" @click="handleClick">
      <span v-if="showEstSlippage">
        <i18n-t
          keypath="trade.estSlippage"
          class="text-xs text-coolGray-400 mx-1"
        >
          <template #estSlippage>
            <SharedAmount
              v-bind="{
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: estSlippageDecimals,
                amount: adaptedEstSlippagePercentage
              }"
              :data-cy="
                dataCyTag(
                  isSpot
                    ? SpotMarketCyTags.DisplayedEstimatedSlippage
                    : PerpetualMarketCyTags.DisplayedEstimatedSlippage
                )
              "
            />
          </template>
        </i18n-t>
        /
      </span>
      <span>
        <i18n-t keypath="trade.maxSlippage" class="text-xs text-coolGray-400">
          <template #max>
            <SharedAmount
              v-bind="{
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                amount: slippagePercentage,
                decimals: DEFAULT_PERCENTAGE_DECIMALS
              }"
              :data-cy="
                dataCyTag(
                  isSpot
                    ? SpotMarketCyTags.DisplayedSlippageTolerance
                    : PerpetualMarketCyTags.DisplayedSlippageTolerance
                )
              "
            />
          </template>
        </i18n-t>
      </span>
    </p>
    <template #panel>
      <p class="text-xs text-coolGray-200 max-w-xs p-1">
        {{ $t('trade.slippageTooltip') }}
      </p>
    </template>
  </UPopover>
</template>
