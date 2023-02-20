<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

defineProps({
  hideBalances: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  usdPriceStatus: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})
</script>

<template>
  <PartialsAccountBalancesRowWrapper
    v-bind="{
      balance,
      hideBalances,
      usdPriceStatus
    }"
  />
</template>
