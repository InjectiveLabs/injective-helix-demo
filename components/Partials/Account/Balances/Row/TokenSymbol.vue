<script lang="ts" setup>
import { AccountBalance } from '@/types'

defineProps({
  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})
</script>

<template>
  <div class="flex justify-start items-center gap-2">
    <slot name="token">
      <CommonTokenIcon :token="balance.token" />
    </slot>

    <div class="flex justify-start gap-2 items-center">
      <span
        class="text-white font-bold tracking-wide text-sm h-auto flex items-center"
        data-cy="wallet-balance-token-symbol-table-data"
      >
        {{ balance.token.symbol }}
      </span>

      <slot name="symbolSuffix" />
    </div>
  </div>
</template>
