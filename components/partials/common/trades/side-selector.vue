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
        :key="`side-selector-${index}`"
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
import { TradeDirection } from '@injectivelabs/ts-types'
import VDropdown from '~/components/elements/dropdown.vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'

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
          text: this.$t('trade.buy'),
          value: TradeDirection.Buy
        },
        {
          text: this.$t('trade.sell'),
          value: TradeDirection.Sell
        }
      ]
    }
  },

  computed: {
    selectedValue(): string {
      const { list, value: selected } = this

      if (!selected) {
        return this.$t('trade.side')
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
