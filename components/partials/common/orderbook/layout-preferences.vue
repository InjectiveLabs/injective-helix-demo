<template>
  <div class="flex flex-start items-center gap-2 h-6">
    <button
      class="w-6 h-6 flex justify-center items-center hover:opacity-100"
      :class="{
        'opacity-100': orderbookLayout === OrderbookLayout.Default,
        'opacity-30': orderbookLayout !== OrderbookLayout.Default
      }"
      @click="setOrderbookLayout(OrderbookLayout.Default)"
    >
      <IconDefault class="w-3 h-3" />
    </button>

    <button
      class="w-6 h-6 flex justify-center items-center hover:opacity-100"
      :class="{
        'opacity-100': orderbookLayout === OrderbookLayout.Buys,
        'opacity-30': orderbookLayout !== OrderbookLayout.Buys
      }"
      @click="setOrderbookLayout(OrderbookLayout.Buys)"
    >
      <IconBuys class="w-3 h-3" />
    </button>

    <button
      class="w-6 h-6 flex justify-center items-center hover:opacity-100"
      :class="{
        'opacity-100': orderbookLayout === OrderbookLayout.Sells,
        'opacity-30': orderbookLayout !== OrderbookLayout.Sells
      }"
      @click="setOrderbookLayout(OrderbookLayout.Sells)"
    >
      <IconSells class="w-3 h-3" />
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import IconDefault from './icons/orderbook-default.vue'
import IconBuys from './icons/orderbook-buys.vue'
import IconSells from './icons/orderbook-sells.vue'
import { OrderbookLayout } from '~/types'
import { UserBasedState } from '~/store/app'

export default Vue.extend({
  components: {
    IconDefault,
    IconBuys,
    IconSells
  },

  data() {
    return { OrderbookLayout }
  },

  computed: {
    userState(): UserBasedState {
      return this.$accessor.app.userState
    },

    orderbookLayout(): OrderbookLayout {
      const { userState } = this

      return userState.orderbookLayout
    }
  },

  methods: {
    setOrderbookLayout(orderbookLayout: OrderbookLayout) {
      const { userState } = this

      this.$accessor.app.setUserState({
        ...userState,
        orderbookLayout
      })
    }
  }
})
</script>
