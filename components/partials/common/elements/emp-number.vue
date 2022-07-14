<template>
  <VNumber
    :prefix="prefix"
    :number="formattedNumberWithDecimals.number"
    :decimals="formattedNumberWithDecimals.decimals"
    :class="classes"
  >
    <span slot="addon" class="text-xs text-gray-400 ml-1">
      <slot></slot>
    </span>
  </VNumber>
</template>

<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { getDecimalsBasedOnNumber } from '~/app/utils/helpers'

export default Vue.extend({
  props: {
    number: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    decimals: {
      required: false,
      default: UI_DEFAULT_DISPLAY_DECIMALS,
      type: Number
    },

    prefix: {
      type: String,
      default: ''
    },

    sm: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    formattedNumberWithDecimals(): {
      number: BigNumberInBase
      decimals: number
    } {
      const { number, decimals } = this

      return getDecimalsBasedOnNumber(number, decimals)
    },

    classes(): string {
      const {
        formattedNumberWithDecimals: { number, decimals },
        sm
      } = this
      const classes = ['flex', 'items-end', 'justify-center']

      if (number.toFixed(decimals).length > 16 + decimals || sm) {
        classes.push('text-xs')
      } else if (number.toFixed(decimals).length > 12 + decimals) {
        classes.push('text-sm')
      } else {
        classes.push('text-lg')
      }

      return classes.join(' ')
    }
  }
})
</script>
