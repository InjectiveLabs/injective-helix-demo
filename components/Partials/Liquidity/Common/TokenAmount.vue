<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    amount: string
    symbol: string
    index: number
  }>(),
  {}
)

const tokenStore = useTokenStore()

const token = computed(() => tokenStore.tokenByDenomOrSymbol(props.symbol))

const { valueToString } = useSharedBigNumberFormatter(
  computed(() => props.amount)
)
</script>

<template>
  <div v-if="token" class="flex items-center space-x-2">
    <p v-if="index > 0">+</p>
    <CommonTokenIcon is-sm v-bind="{ token }" />
    <p class="text-gray-400 text-xs">{{ valueToString }} {{ symbol }}</p>
  </div>
</template>
