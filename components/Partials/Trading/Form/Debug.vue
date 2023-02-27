<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  UiPerpetualMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { TradeField, TradeForm, UiMarketWithToken } from '@/types'

const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  isBuy: Boolean,
  isSpot: Boolean,
  isBaseAmount: Boolean,

  fees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  feeRate: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  },

  notionalWithFees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  liquidationPrice: {
    type: Object as PropType<BigNumberInBase>,
    default: undefined
  }
})

const {
  amountForCalculation: amountForCalculationForSpot,
  averagePrice: averagePriceForSpot,
  averagePriceWithSlippage: averagePriceWithSlippageForSpot,
  slippage: slippageForSpot,
  worstPrice: worstPriceForSpot,
  worstPriceWithSlippage: worstPriceWithSlippageForSpot
} = useSpotPrice({
  formValues,
  isBaseAmount: computed(() => props.isBaseAmount),
  market: computed(() => props.market as UiSpotMarketWithToken)
})

const {
  amountForCalculation: amountForCalculationForDerivative,
  averagePrice: averagePriceForDerivative,
  averagePriceWithSlippage: averagePriceWithSlippageForDerivative,
  slippage: slippageForDerivative,
  worstPrice: worstPriceForDerivative,
  worstPriceWithSlippage: worstPriceWithSlippageForDerivative
} = useDerivativePrice({
  formValues,
  isBaseAmount: computed(() => props.isBaseAmount),
  market: computed(() => props.market as UiDerivativeMarketWithToken)
})

const maintenanceMarginRatio = computed(
  () => (props.market as UiPerpetualMarketWithToken).maintenanceMarginRatio
)

const initialMarginRatio = computed(
  () => (props.market as UiPerpetualMarketWithToken).initialMarginRatio
)
</script>

<template>
  <AppDrawer>
    <template #header>
      <p class="flex justify-between text-sm">
        <CommonTextInfo title="Debug" lg />
      </p>
    </template>

    <div class="mt-4 text-xs">
      <div class="flex items center justify-between">
        <span>Buy order</span>
        <span>
          {{ isBuy }}
        </span>
      </div>

      <div class="flex items center justify-between">
        <span>Locked base quantity</span>
        <span>
          {{ isBaseAmount }}
        </span>
      </div>

      <div class="flex items center justify-between">
        <span>Amount for calculation</span>
        <span v-if="isSpot">{{ amountForCalculationForSpot.toFixed() }}</span>
        <span v-else>{{ amountForCalculationForDerivative.toFixed() }}</span>
      </div>

      <div class="flex items center justify-between">
        <span>Average price</span>
        <span v-if="isSpot">{{ averagePriceForSpot.toFixed() }}</span>
        <span v-else>{{ averagePriceForDerivative.toFixed() }}</span>
      </div>

      <div class="flex items center justify-between">
        <span>Average price with slippage</span>
        <span v-if="isSpot">
          {{ averagePriceWithSlippageForSpot.toFixed() }}
        </span>
        <span v-else>
          {{ averagePriceWithSlippageForDerivative.toFixed() }}
        </span>
      </div>

      <div class="flex items center justify-between">
        <span>Worst price</span>
        <span v-if="isSpot">{{ worstPriceForSpot.toFixed() }}</span>
        <span v-else>{{ worstPriceForDerivative.toFixed() }}</span>
      </div>

      <div class="flex items center justify-between">
        <span>Worst price with slippage</span>
        <span v-if="isSpot">{{ worstPriceWithSlippageForSpot.toFixed() }}</span>
        <span v-else>{{ worstPriceWithSlippageForDerivative.toFixed() }}</span>
      </div>

      <div class="flex items center justify-between">
        <span>Fees</span>
        <span>{{ fees.toFixed() }}</span>
      </div>

      <div class="flex items center justify-between">
        <span>Fee Rate</span>
        <span>{{ feeRate.toFixed() }}</span>
      </div>

      <div class="flex items center justify-between">
        <span>Slippage</span>
        <span v-if="isSpot">{{ slippageForSpot.toFixed() }}</span>
        <span v-else>{{ slippageForDerivative.toFixed() }}</span>
      </div>

      <div v-if="!isSpot" class="flex items center justify-between">
        <span>Leverage</span>
        <span>{{ formValues[TradeField.Leverage] }}</span>
      </div>

      <div v-if="liquidationPrice" class="flex items center justify-between">
        <span>Liquidation Price</span>
        <span>{{ liquidationPrice.toFixed() }}</span>
      </div>

      <div
        v-if="maintenanceMarginRatio"
        class="flex items center justify-between"
      >
        <span>Maintenance margin ratio</span>
        <span>{{ maintenanceMarginRatio }}</span>
      </div>

      <div v-if="initialMarginRatio" class="flex items center justify-between">
        <span>Initial margin ratio</span>
        <span>{{ initialMarginRatio }}</span>
      </div>

      <div class="flex items center justify-between">
        <span v-if="isSpot">Notional Value</span>
        <span v-else>Notional with leverage</span>
        <span>{{ notionalValue.toFixed() }}</span>
      </div>

      <div class="flex items center justify-between">
        <span v-if="isSpot">Notional with fee</span>
        <span v-else>Notional with leverage and fee</span>
        <span>{{ notionalWithFees.toFixed() }}</span>
      </div>
    </div>
  </AppDrawer>
</template>
