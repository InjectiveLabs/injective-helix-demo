<template>
  <v-dropdown dark hide-bottom-border tight no-padding>
    <template slot="title">
      <div
        class="text-xs leading-5 select-none"
        data-cy="markets-quote-drop-down"
      >
        <span class="text-gray-400 mr-3">{{ label }}:</span>
        <span class="text-primary-500">{{ currentLabel }}</span>
      </div>
    </template>

    <div class="text-center cursor-pointer">
      <SelectorItem
        v-for="item in options"
        :key="`list-${item.value}`"
        :item="item"
        :data-cy="`markets-${item.value}-option`"
        @click="handleSelect"
      >
        <span>{{ item.label }}</span>
      </SelectorItem>
    </div>
  </v-dropdown>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'
import VDropdown from '~/components/elements/dropdown.vue'

interface TabMenuSelectorOption {
  label: string
  value: string
}

export default Vue.extend({
  components: {
    SelectorItem,
    VDropdown
  },

  props: {
    value: {
      type: String,
      required: true
    },

    options: {
      type: Array as PropType<TabMenuSelectorOption[]>,
      required: true
    },

    label: {
      type: String,
      required: true
    }
  },

  data() {
    return {}
  },

  computed: {
    currentLabel() {
      const { options, value } = this

      const currentOption = options.find(
        (option: TabMenuSelectorOption) => option.value === value
      )

      if (!currentOption) {
        return ''
      }

      return currentOption.label
    }
  },

  methods: {
    handleSelect(option: TabMenuSelectorOption) {
      this.$emit('select', option.value)
    }
  }
})
</script>
