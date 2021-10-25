<template>
  <tr>
    <td class="h-8 text-left font-mono"># {{ index + 1 }}</td>
    <td class="h-8 text-right font-mono">
      {{ stakedAmountToFormat }}
    </td>
    <td class="h-8 text-right font-mono">
      {{ feesAmountToFormat }}
    </td>
    <td class="h-8 text-right font-mono">{{ makerFeeDiscountToFormat }}%</td>
    <td class="h-8 text-right font-mono">{{ takerFeeDiscountToFormat }}%</td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import { FeeDiscountTierInfo } from '~/types/exchange'

export default Vue.extend({
  props: {
    tier: {
      required: true,
      type: Object as PropType<FeeDiscountTierInfo>
    },

    index: {
      required: true,
      type: Number
    }
  },

  computed: {
    stakedAmount(): BigNumberInBase {
      const { tier } = this

      if (!tier.stakedAmount) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(tier.stakedAmount)
    },

    stakedAmountToFormat(): string {
      const { stakedAmount } = this

      return stakedAmount.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
    },

    feesAmount(): BigNumberInBase {
      const { tier } = this

      if (!tier.feePaidAmount) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(tier.feePaidAmount).toBase(6 /* USDT */)
    },

    feesAmountToFormat(): string {
      const { stakedAmount } = this

      return stakedAmount.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
    },

    makerFeeDiscount(): BigNumberInBase {
      const { tier } = this

      if (!tier.makerDiscountRate) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(tier.makerDiscountRate).toBase()
    },

    makerFeeDiscountToFormat(): string {
      const { makerFeeDiscount } = this

      return makerFeeDiscount.toFormat(4)
    },

    takerFeeDiscount(): BigNumberInBase {
      const { tier } = this

      if (!tier.takerDiscountRate) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(tier.takerDiscountRate).toBase()
    },

    takerFeeDiscountToFormat(): string {
      const { takerFeeDiscount } = this

      return takerFeeDiscount.toFormat(4)
    }
  }
})
</script>
