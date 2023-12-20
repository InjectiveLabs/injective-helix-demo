<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

defineProps({
  isHideBalances: Boolean,

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
      isHideBalances,
      usdPriceStatus
    }"
  />
</template>
