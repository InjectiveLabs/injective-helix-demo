<template>
  <v-panel
    class="relative w-full"
    :title="$t('order_book')"
    content-class="w-full"
  >
    <v-orderbook-context keep-alive></v-orderbook-context>
    <v-orderbook class="flex-1" />
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import OrderBook from './order-book.vue'
import OrderBookContext from './order-book-context.vue'

export default Vue.extend({
  components: {
    'v-orderbook': OrderBook,
    'v-orderbook-context': OrderBookContext
  }
})
</script>
