<template>
  <div class="cursor-pointer" @click="handleClick">
    <div class="flex items-center justify-start">
      <img
        :src="item.token.icon"
        :alt="item.token.name"
        class="mr-4 ml-2"
        :class="[small ? 'w-5 h-5 md:w-7 md:h-7' : 'w-6 h-6 md:w-8 md:h-8']"
      />
      <div class="text-left">
        <p class="text-gray-200 text-sm font-bold">{{ item.ticker }}</p>
        <p class="text-gray-500 text-xs capitalize">
          {{ item.token.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { UiDerivativeMarket, UiSpotMarket } from '~/types'

export default Vue.extend({
  props: {
    small: {
      type: Boolean,
      default: false
    },

    item: {
      type: Object as PropType<UiDerivativeMarket | UiSpotMarket>,
      required: true
    }
  },

  methods: {
    handleClick() {
      const { item } = this

      this.$emit('click', item)
    }
  }
})
</script>
