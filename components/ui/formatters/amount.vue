<script lang="ts">
import Vue, { PropType, VNode } from 'vue'
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

    greyZeros: {
      required: false,
      default: false,
      type: Boolean
    },

    decimals: {
      required: true,
      type: Number
    }
  },

  computed: {
    formatFunction(): Function {
      return formatAmount
    },

    formattedValue(): any {
      return this.formatFunction(this.value, this.decimals)
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
          decimals: this.decimals,
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
