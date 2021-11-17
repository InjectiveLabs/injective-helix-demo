<template>
  <v-dropdown hide-bottom-border>
    <template slot="title">
      <div class="w-12 flex items-center justify-end">
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
  </v-dropdown>
</template>

<script lang="ts">
import Vue from 'vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'
import Dropdown from '~/components/elements/dropdown.vue'

export default Vue.extend({
  components: {
    SelectorItem,
    'v-dropdown': Dropdown
  },

  props: {
    value: {
      type: Number,
      required: true
    },

    minTick: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      list: [
        {
          value: -2,
          text: '100'
        },
        {
          value: -1,
          text: '10'
        },
        {
          value: 0,
          text: '1'
        },
        {
          value: 1,
          text: '0.1'
        },
        {
          value: 2,
          text: '0.01'
        },
        {
          value: 3,
          text: '0.001'
        }
      ]
    }
  },

  computed: {
    display(): string {
      const { list, value } = this

      return list.find((item) => value === item.value)?.text || ''
    },

    filteredList(): Record<string, any>[] {
      const { minTick, list } = this

      const index = list.findIndex(({ value }) => value === minTick)

      return [...list].slice(Math.max(index - 3, 0), index + 1)
    }
  },

  methods: {
    handleClick(item: Record<string, any>) {
      this.$emit('click', item.value)
    }
  }
})
</script>
