<script lang="ts">
import Vue, { PropType, VNode } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { formatPrice } from '~/app/utils/formatters'
import { SpotOrderType } from '~/types'

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

    type: {
      required: false,
      type: String as PropType<SpotOrderType>,
      default: SpotOrderType.Buy
    },

    decimals: {
      required: true,
      type: Number
    }
  },

  computed: {
    formatFunction(): Function {
      return formatPrice
    },

    textClass(): string {
      if (!this.type) {
        return ''
      }

      return [SpotOrderType.Buy].includes(this.type)
        ? 'text-primary-500'
        : 'text-accent-500'
    }
  },

  render(createElement): VNode {
    const parentAttributes = {
      attrs: this.$attrs,
      on: this.$listeners,
      class: `${this.textClass}`
    }

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
})
</script>
