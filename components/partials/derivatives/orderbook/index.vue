<template>
  <v-panel class="relative w-full" :title="$t('order_book')">
    <v-orderbook-context slot="context" keep-alive></v-orderbook-context>
    <v-orderbook />
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
