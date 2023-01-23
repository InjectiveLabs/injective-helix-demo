<script lang="ts" setup>
import { PropType } from 'vue'
import { getTokenLogoWithVendorPathPrefix } from '@injectivelabs/sdk-ui-ts'
import { BaseDropdownOption } from '@injectivelabs/ui-shared'

const props = defineProps({
  active: Boolean,

  option: {
    type: Object as PropType<BaseDropdownOption>,
    required: true
  }
})

const derivativeStore = useDerivativeStore()

const markets = computed(() => {
  return derivativeStore.markets
})

const tokenLogo = computed(() => {
  if (props.option.value === '') {
    return undefined
  }

  const market = markets.value.find(
    (market) =>
      market.baseToken.denom === props.option.value ||
      market.quoteToken.denom === props.option.value
  )

  if (!market) {
    return undefined
  }

  const logo =
    market.quoteDenom === props.option.value
      ? market.quoteToken.logo
      : market.baseToken.logo

  return getTokenLogoWithVendorPathPrefix(logo)
})
</script>

<template>
  <div class="flex items-end justify-start gap-2">
    <img class="w-6 h-6 rounded-full" :src="tokenLogo" :alt="option.display" />
    <span
      class="text-sm"
      :class="{ 'text-white': !active, 'text-blue-500': active }"
    >
      {{ option.display }}
    </span>
  </div>
</template>
