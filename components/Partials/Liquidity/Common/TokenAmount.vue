<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

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
</script>

<template>
  <div v-if="token" class="flex items-center space-x-2">
    <p v-if="index > 0">+</p>
    <CommonTokenIcon is-sm v-bind="{ token }" />
    <p class="text-coolGray-400 text-xs">
      <AppAmount
        v-bind="{
          amount: amount,
          decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
        }"
      />
      <span class="ml-1">{{ symbol }}</span>
    </p>
  </div>
</template>
