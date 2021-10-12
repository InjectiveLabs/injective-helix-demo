<template>
  <div class="table-responsive min-h-3xs">
    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            {{ $t('market') }}
          </th>
          <th class="text-right">
            {{ $t('price') }}
          </th>
          <th class="text-right">
            {{ $t('amount') }}
          </th>
          <th class="text-right">
            {{ $t('total') }}
          </th>
          <th class="text-center">
            {{ $t('side') }}
          </th>
          <th class="text-right">
            {{ $t('unfilled') }}
          </th>
          <th class="text-center">
            {{ $t('filled') }}
          </th>
          <th class="text-center">
            {{ $t('actions') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          is="v-order"
          v-for="(order, index) in orders"
          :key="`orders-${index}-${order.orderHash}`"
          :order="order"
        ></tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Order from './order.vue'
import { UiSpotLimitOrder } from '~/types'

export default Vue.extend({
  components: {
    'v-order': Order
  },

  props: {
    orders: {
      required: true,
      type: Array as PropType<UiSpotLimitOrder[]>
    }
  }
})
</script>
