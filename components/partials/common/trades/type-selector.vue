<template>
  <v-dropdown round hide-bottom-border>
    <template slot="title">
      <div class="flex items-center justify-between bg-gray-900 rounded-full">
        <span class="text-xs ml-2">{{ selectedValue }}</span>
      </div>
    </template>

    <div class="text-center cursor-pointer">
      <selector-item
        v-for="(type, index) in list"
        :key="`type-selector-${index}`"
        :item="type"
        @click="handleClick"
      >
        {{ type.text }}
      </selector-item>
    </div>
  </v-dropdown>
</template>

<script lang="ts">
import Vue from 'vue'
import VDropdown from '~/components/elements/dropdown.vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'
import { tradeTypes } from '~/types/enums'

export default Vue.extend({
  components: {
    VDropdown,
    SelectorItem
  },

  props: {
    value: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      list: [
        {
          text: this.$t('trade.all'),
          value: undefined
        },
        {
          text: this.$t('trade.market'),
          value: tradeTypes.Market
        },
        {
          text: this.$t('trade.limit'),
          value: tradeTypes.Limit
        }
      ]
    }
  },

  computed: {
    selectedValue(): string {
      const { list, value: selected } = this

      if (!selected) {
        return this.$t('trade.type')
      }

      return (
        list.find(({ value }) => value === selected)?.text ||
        this.$t('trade.all')
      )
    }
  },

  methods: {
    handleClick({ value }: { value: string }) {
      this.$emit('click', value)
    }
  }
})
</script>
