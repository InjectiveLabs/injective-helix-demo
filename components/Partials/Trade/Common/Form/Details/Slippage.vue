<script setup lang="ts">
import { DEFAULT_PERCENTAGE_DECIMALS } from '@shared/utils/constant'
import {
  UI_ZERO_DECIMAL,
  MIN_EST_SLIPPAGE,
  DEFAULT_EST_SLIPPAGE,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { BigNumberInBase } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    formAmount: string
    showEstSlippage: boolean
    estSlippageCyTag?: string
    slippageToleranceCyTag?: string
    estSlippagePercentage: BigNumberInBase
    slippageTolerance: BigNumberInBase | string | number
  }>(),
  {
    showEstSlippage: true
  }
)

const emit = defineEmits<{ click: [] }>()

const adaptedEstSlippagePercentage = computed(() => {
  if (props.formAmount === '0') {
    return DEFAULT_EST_SLIPPAGE
  }

  if (props.estSlippagePercentage.lt(MIN_EST_SLIPPAGE)) {
    return MIN_EST_SLIPPAGE
  }

  return props.estSlippagePercentage
})

const estSlippageDecimals = computed(() => {
  if (props.formAmount === '0') {
    return UI_ZERO_DECIMAL
  }

  return UI_DEFAULT_DISPLAY_DECIMALS
})

function handleClick() {
  emit('click')
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
              :data-cy="estSlippageCyTag"
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
                amount: slippageTolerance,
                decimals: DEFAULT_PERCENTAGE_DECIMALS
              }"
              :data-cy="slippageToleranceCyTag"
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
