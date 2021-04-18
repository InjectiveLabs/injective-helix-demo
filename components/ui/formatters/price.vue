<script lang="ts">
import Vue, { VNode, PropType } from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import { formatPrice } from '~/app/utils/formatters'

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
      type: Object as PropType<BigNumberInWei>
    },

    decimals: {
      required: true,
      type: Number
    }
  },

  computed: {
    formatFunction(): Function {
      return formatPrice
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
        decimals: this.decimals,
        suffix: this.suffix,
        prefix: this.prefix,
        value: this.value
      }
    })
  }
})
</script>
