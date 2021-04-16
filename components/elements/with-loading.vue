<script lang="ts">
import Vue, { PropType, VNode } from 'vue'
import { Status } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    status: {
      required: false,
      default: () => new Status(),
      type: Object as PropType<Status>
    },

    isLoading: {
      required: false,
      type: Boolean,
      default: false
    },

    wrapper: {
      required: false,
      type: Boolean,
      default: false
    },

    show: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  render(createElement): VNode {
    const parentAttributes = {
      attrs: this.$attrs,
      on: this.$listeners
    }

    if (this.show && this.$slots.default !== undefined) {
      if (this.status.isIdle() && !this.isLoading) {
        return this.$slots.default[0]
      }

      if (this.wrapper) {
        return createElement(
          'div',
          {
            class: 'relative h-full w-full'
          },
          [
            createElement('div', {}, [
              createElement('v-ui-loading', {
                ...parentAttributes
              }),
              this.$slots.default[0]
            ])
          ]
        )
      }

      return createElement('div', {}, [
        createElement('v-ui-loading', {
          ...parentAttributes
        }),
        this.$slots.default[0]
      ])
    }

    if (this.status.isLoading() || this.isLoading) {
      if (this.wrapper) {
        return createElement(
          'div',
          {
            class: 'relative h-full w-full'
          },
          [
            createElement('v-ui-loading', {
              ...parentAttributes
            })
          ]
        )
      }

      return createElement('v-ui-loading', {
        ...parentAttributes
      })
    }

    if (this.$slots.default !== undefined) {
      return this.$slots.default[0]
    }

    return createElement('span')
  }
})
</script>
