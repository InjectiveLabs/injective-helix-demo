<template>
  <div
    :class="$attrs['class'] ? $attrs['class'] : 'text-white'"
    class="font-mono"
  >
    <span>{{ prefix || '' }}{{ formattedNumber[0] }}</span
    ><span v-if="formattedNumber[1]" class="text-gray-600 opacity-50">{{
      formattedNumber[1] || ''
    }}</span
    >{{ suffix || '' }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { formatAmount } from '~/app/utils/formatters'

export default Vue.extend({
  props: {
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

    value: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    decimals: {
      required: true,
      type: Number
    },

    dontGroupValues: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    formattedNumber(): string[] {
      const formatted = formatAmount(this.value, this.decimals)

      if (this.dontGroupValues) {
        return [formatted]
      }

      const match = formatted.match(/^-?([\d,]+)((\.)(\d+?\d+?)(0*))?$/)
      const groups = !match
        ? formatted
          ? [formatted]
          : []
        : match[2]
        ? [`${match[1]}${match[3]}${match[4]}`, match[5]]
        : [`${match[1]}.0`]

      return groups
    }
  }
})
</script>
