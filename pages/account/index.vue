<script setup lang="ts">
import { Status } from '@injectivelabs/utils'
import { PropType } from 'vue'
import { AccountBalance } from '~/types'

defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  },
  usdPriceStatus: {
    type: Object as PropType<Status>,
    required: true
  }
})
</script>

<template>
  <PartialsAccountBalances
    v-bind="{
      balances,
      hideBalances,
      usdPriceStatus
    }"
  />
</template>
