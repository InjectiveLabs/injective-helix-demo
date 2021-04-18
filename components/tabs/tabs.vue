<script lang="ts">
import Vue, { VNode } from 'vue'

export default Vue.extend({
  model: {
    prop: 'currentIndex',
    event: 'change'
  },

  props: {
    elementClass: {
      required: false,
      type: String,
      default: 'tabs'
    },

    tablist: {
      required: false,
      default: true,
      type: Boolean
    },

    currentIndex: {
      required: true,
      type: Number || String
    },

    full: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    rootElementClass(): string {
      return `${this.elementClass} ${this.full ? 'tabs-expand' : ''}`
    }
  },

  render(createElement): VNode {
    if (!this.$slots.default) {
      return createElement()
    }

    const tabs = this.$slots.default.filter(
      ({ componentOptions }) => componentOptions
    )

    // @ts-ignore
    const tabList = tabs.map(({ componentOptions: { propsData } }, index) => {
      const { label } = propsData

      return createElement(
        'li',
        {
          staticClass: 'tab',
          attrs: {
            role: 'tab',
            'aria-selected': index === this.currentIndex ? 'true' : 'false'
          },
          on: {
            click: () => {
              this.$emit('change', index)
            }
          }
        },
        [createElement('span', {}, label)]
      )
    })

    const tabListComponent = createElement(
      'ul',
      {
        staticClass: 'tablist',
        attrs: {
          role: 'tablist'
        }
      },
      tabList
    )
    const tablistSlot = createElement(
      'div',
      { slot: 'tablistContext' },
      this.$slots.tablistContext ?? []
    )
    const tabListWrapper = createElement(
      'div',
      {
        staticClass:
          'flex items-center justify-between border-b h-12 v-panel-title'
      },
      [tabListComponent, tablistSlot]
    )

    return createElement(
      'div',
      {
        class: this.rootElementClass,
        attrs: {
          role: 'tabs'
        }
      },
      [
        this.tablist && tabListWrapper,

        createElement(
          'transition',
          {
            props: {
              name: 'slide-content',
              mode: 'out-in'
            }
          },
          [tabs[this.currentIndex]]
        )
      ]
    )
  }
})
</script>
