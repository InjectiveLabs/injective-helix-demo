<script lang="ts">
import Vue, { VNode } from 'vue'
import { BigNumber } from '@injectivelabs/utils'
import { formatPercent } from '~/app/utils/formatters'

export default Vue.extend({
  props: {
    value: {
      required: true,
      type: String
    },

    appendPlusSign: {
      required: false,
      default: true,
      type: Boolean
    },

    multiplyBy: {
      required: false,
      type: Number,
      default: 0
    },

    precision: {
      required: true,
      type: Number,
      default: 0
    }
  },

  computed: {
    formattedValue(): string {
      const valueToBeFormatted = new BigNumber(this.value)

      if (this.multiplyBy) {
        valueToBeFormatted.times(this.multiplyBy)
      }

      const { value: number, precision, appendPlusSign } = this
      return formatPercent({
        number,
        precision,
        appendPlusSign
      })
    }
  },

  render(createElement): VNode {
    const parentAttributes = {
      class: 'font-mono',
      attrs: this.$attrs,
      on: this.$listeners
    }

    return createElement('span', parentAttributes, [this.formattedValue])
  }
})
</script>
