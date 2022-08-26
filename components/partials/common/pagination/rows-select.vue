<template>
  <div class="flex items-center">
    <span class="mr-2">{{ $t('pagination.showRows') }}</span>
    <Dropdown>
      <template slot="title">
        <div class="flex items-center justify-end">
          <span>{{ limit }}</span>
        </div>
      </template>

      <div class="text-center cursor-pointer">
        <SelectorItem
          v-for="item in options"
          :key="`limit-option-${item}`"
          :item="item"
          @click="handleClick"
        >
          {{ item }}
        </SelectorItem>
      </div>
    </Dropdown>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Dropdown from '~/components/partials/common/dropdown.vue'
import SelectorItem from '~/components/partials/common/pagination/selector-item.vue'

export default Vue.extend({
  components: {
    Dropdown,
    SelectorItem
  },

  props: {
    extraLimitOptions: {
      type: Array as PropType<number[]>,
      default: () => []
    },

    limit: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      limitOptions: [10, 20, 50, 100]
    }
  },

  computed: {
    options(): number[] {
      const { limitOptions, extraLimitOptions } = this

      return [...limitOptions, ...extraLimitOptions].sort((a, b) => a - b)
    }
  },

  methods: {
    handleClick(item: string) {
      const { limit } = this

      if (Number(item) !== limit) {
        this.$emit('update:limit', Number(item))
      }
    }
  }
})
</script>
