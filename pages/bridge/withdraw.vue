<script setup lang="ts">
import { BridgeField, BridgeType } from '@/types'

useStringField({
  name: BridgeField.BridgeType,
  initialValue: BridgeType.Withdraw
})
</script>

<template>
  <h1>withdraw</h1>
</template>
