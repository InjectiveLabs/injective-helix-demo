<template>
  <VDropdown hide-bottom-border>
    <template slot="title">
      <div class="flex items-center justify-end w-[80px]">
        <span class="text-xs ml-2">{{ display }}</span>
      </div>
    </template>

    <div class="text-center cursor-pointer">
      <SelectorItem
        v-for="item in filteredList"
        :key="`list-${item.value}`"
        :item="item"
        @click="handleClick"
      >
        {{ item.text }}
      </SelectorItem>
    </div>
  </VDropdown>
</template>

<script lang="ts">
import Vue from 'vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'
import VDropdown from '~/components/elements/dropdown.vue'
import { aggregationList } from '~/app/data/aggregation'

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

    minTick: {
      type: String,
      required: true
    },

    maxTick: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      list: aggregationList
    }
  },

  computed: {
    display(): string {
      const { list, value } = this

      return list.find((item) => value === item.value)?.text || ''
    },

    filteredList(): Record<string, any>[] {
      const { list, minTick, maxTick } = this

      if (maxTick) {
        const startIndex = list.findIndex(({ value }) => value === maxTick)
        const endIndex = list.findIndex(({ value }) => value === minTick)

        return list.slice(startIndex, endIndex + 1)
      }

      const index = list.findIndex(({ value }) => value === minTick)

      return list.slice(Math.max(index - 2, 0), index + 1)
    }
  },

  methods: {
    handleClick(item: Record<string, any>) {
      this.$emit('click', item.value)
    }
  }
})
</script>
