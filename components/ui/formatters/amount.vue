<script lang="ts">
import Vue, { PropType, VNode } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { formatAmount } from '~/app/utils/formatters'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

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

    greyZeros: {
      required: false,
      default: false,
      type: Boolean
    },

    decimals: {
      required: false,
      type: Number,
      default: UI_DEFAULT_DISPLAY_DECIMALS
    },

    deriveDecimals: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  computed: {
    formatFunction(): Function {
      return formatAmount
    },

    derivedDecimals(): number {
      const { value, decimals, deriveDecimals } = this

      if (!deriveDecimals) {
        return decimals
      }

      const valueToString = value.toFixed()
      const parts = valueToString.split('.')
      const derivedDecimals = parts[1] ? parts[1].length : 0

      return derivedDecimals
    },

    formattedValue(): any {
      return this.formatFunction(this.value, this.derivedDecimals)
    }
  },

  render(createElement): VNode {
    const parentAttributes = {
      attrs: this.$attrs,
      on: this.$listeners,
      class: 'font-mono'
    }

    if (this.greyZeros) {
      return createElement('v-ui-format-number', {
        ...parentAttributes,
        props: {
          formatter: this.formatFunction,
          decimals: this.derivedDecimals,
          value: this.value,
          suffix: this.suffix,
          prefix: this.prefix
        }
      })
    }

    return createElement('span', parentAttributes, [this.formattedValue])
  }
})
</script>
