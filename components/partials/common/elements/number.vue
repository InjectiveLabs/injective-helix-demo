<template>
  <span :class="classes">
    <span>{{ prefix || '' }}{{ formattedNumber[0] }}</span>
    <span v-if="formattedNumber[1]" class="text-gray-500 opacity-50">
      {{ formattedNumber[1] || '' }}
    </span>
    {{ suffix || '' }}
    <slot slot="addon" class="text-xs text-gray-400"></slot>
  </span>
</template>

<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { getDecimalsFromNumber } from '~/app/utils/helpers'

export default Vue.extend({
  props: {
    sizeAdjust: {
      required: true,
      type: Boolean
    },

    decimals: {
      required: false,
      default: UI_DEFAULT_DISPLAY_DECIMALS,
      type: Number
    },

    useNumberDecimals: {
      required: false,
      default: false,
      type: Boolean
    },

    xs: {
      required: false,
      type: Boolean
    },

    sm: {
      required: false,
      type: Boolean
    },

    lg: {
      required: false,
      type: Boolean
    },

    prefix: {
      required: false,
      type: String,
      default: ''
    },

    suffix: {
      required: false,
      type: String,
      default: ''
    },

    number: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    dontGroupValues: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    classes() {
      const { sizeAdjust, number, decimals, dontGroupValues, xs, sm, lg } = this
      const classes = ['font-mono']

      if (this.$attrs.class) {
        return classes.join(' ')
      }

      if (xs) {
        classes.push('text-xs')
      } else if (sm) {
        classes.push('text-sm')
      } else if (lg) {
        if (sizeAdjust) {
          if (number.toFixed(decimals).length > 12 + decimals) {
            classes.push('text-xs')
          } else if (number.toFixed(decimals).length > 8) {
            classes.push('text-sm')
          }
        } else {
          classes.push('text-lg')
        }
      }

      if (!dontGroupValues) {
        classes.push('flex', 'items-center', 'justify-center')
      }

      return classes.join(' ')
    },

    formattedNumber(): string[] {
      const { dontGroupValues, number, useNumberDecimals, decimals } = this

      if (number.eq(0)) {
        return [number.toFixed(0)]
      }

      const actualDecimals = useNumberDecimals
        ? getDecimalsFromNumber(number.toNumber())
        : decimals
      const formattedNumber = number.toFormat(actualDecimals)

      if (dontGroupValues) {
        return [formattedNumber]
      }

      const match = formattedNumber.match(/^-?([\d,]+)((\.)(\d+?\d+?)(0*))?$/)
      const groups = !match
        ? formattedNumber
          ? [formattedNumber]
          : []
        : match[2]
        ? [`${match[1]}${match[3]}${match[4]}`, match[5]]
        : [`${match[1]}.0`]

      return groups
    }
  }
})
</script>
