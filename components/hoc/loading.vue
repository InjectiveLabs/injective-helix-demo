<script lang="ts">
import Vue, { PropType, VNode } from 'vue'
import { Status } from '@injectivelabs/utils'
import VLoading from '~/components/elements/loading.vue'

export default Vue.extend({
  components: {
    VLoading
  },

  props: {
    status: {
      required: false,
      default: () => new Status(),
      type: Object as PropType<Status>
    }
  },

  render(createElement): VNode {
    const parentAttributes = {
      attrs: this.$attrs,
      on: this.$listeners
    }

    if (this.$slots.default !== undefined) {
      if (this.status.isIdle()) {
        return this.$slots.default[0]
      }

      return createElement('div', { class: 'my-4 min-h-loading' }, [
        createElement('v-loading', {
          ...parentAttributes
        })
      ])
    }

    return createElement('span')
  }
})
</script>
