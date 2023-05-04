<script setup lang="ts">
import { PropType } from 'vue'
import { AccountBalance } from '~/types'

defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})
</script>

<template>
  <PartialsAccountPositions v-bind="{ hideBalances, balances }" />
</template>
