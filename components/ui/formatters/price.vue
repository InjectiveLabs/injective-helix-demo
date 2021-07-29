<script lang="ts">
import Vue, { VNode, PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { formatPrice } from '~/app/utils/formatters'
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
      return formatPrice
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
    }
  },

  render(createElement): VNode {
    const parentAttributes = {
      attrs: this.$attrs,
      on: this.$listeners
    }

    return createElement('v-ui-format-number', {
      ...parentAttributes,
      props: {
        formatter: this.formatFunction,
        decimals: this.derivedDecimals,
        suffix: this.suffix,
        prefix: this.prefix,
        value: this.value
      }
    })
  }
})
</script>
