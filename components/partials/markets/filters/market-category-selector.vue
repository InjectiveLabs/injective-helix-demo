<template>
  <v-dropdown dark hide-bottom-border tight>
    <template slot="title">
      <div class="uppercase text-xs tracking-wide leading-5 select-none">
        <span class="text-gray-500 mr-3">{{ $t('markets.category') }}:</span>
        <span class="text-primary-500">{{ type }}</span>
      </div>
    </template>

    <div class="text-center cursor-pointer">
      <SelectorItem
        v-for="item in marketCategoryTypes"
        :key="`list-${item}`"
        :item="item"
        @click="handleTypeClick"
      >
        <span class="capitalize">{{ item }}</span>
      </SelectorItem>
    </div>
  </v-dropdown>
  </v-dropdown>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'
import VDropdown from '~/components/elements/dropdown.vue'
import { MarketCategoryType } from '~/types'

export default Vue.extend({
  components: {
    SelectorItem,
    VDropdown
  },

  props: {
    type: {
      type: String as PropType<MarketCategoryType>,
      required: true
    }
  },

  data() {
    return {
      MarketCategoryType,
      marketCategoryTypes: Object.values(MarketCategoryType)
    }
  },

  methods: {
    handleTypeClick(type: MarketCategoryType) {
      this.$emit('click', type)
    }
  }
})
</script>
