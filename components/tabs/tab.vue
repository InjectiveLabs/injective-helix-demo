<script lang="ts">
import Vue from 'vue'
import { uniqueId } from '~/app/utils/generators'

export default Vue.extend({
  props: {
    elementClass: {
      required: false,
      default: 'tab-content',
      type: String
    },

    label: {
      required: true,
      type: String
    },

    isActive: {
      required: false,
      type: Boolean,
      default: true
    }
  },

  render(createElement) {
    return createElement(
      'div',
      {
        class: this.elementClass,
        key: `tab-${uniqueId()}`,
        attrs: {
          role: 'tabpanel'
        }
      },
      this.$slots.default
    )
  }
})
</script>
