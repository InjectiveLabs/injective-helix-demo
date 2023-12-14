<script setup lang="ts">
const props = defineProps({
  amount: {
    type: String,
    required: true
  },

  symbol: {
    type: String,
    required: true
  },

  index: {
    type: Number,
    required: true
  }
})

const tokenStore = useTokenStore()

const token = computed(() =>
  tokenStore.tokens.find(({ symbol }) => symbol === props.symbol)
)

const { valueToString } = useBigNumberFormatter(computed(() => props.amount))
</script>

<template>
  <div v-if="token" class="flex items-center space-x-2">
    <p v-if="index > 0">+</p>
    <CommonTokenIcon is-sm v-bind="{ token }" />
    <p class="text-gray-400 text-xs">{{ valueToString }} {{ symbol }}</p>
  </div>
</template>
