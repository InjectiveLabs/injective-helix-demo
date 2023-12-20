<script lang="ts" setup>
import { getTokenLogoWithVendorPathPrefix } from '@injectivelabs/sdk-ui-ts'
import type { Token, TokenWithPrice } from '@injectivelabs/token-metadata'

const props = defineProps({
  isSm: Boolean,
  isLg: Boolean,
  isXl: Boolean,

  token: {
    type: Object as PropType<Token | TokenWithPrice>,
    required: true
  }
})

const logoPath = computed(() =>
  getTokenLogoWithVendorPathPrefix(props.token.logo)
)

const sizeClasses = computed(() => {
  if (props.isSm) {
    return 'w-4 h-4 min-w-4'
  }

  if (props.isLg) {
    return 'w-8 h-8 min-w-8'
  }

  if (props.isXl) {
    return 'w-10 h-10 min-w-10'
  }

  return 'w-6 h-6 min-w-6'
})
</script>

<template>
  <img
    class="rounded-full"
    :class="sizeClasses"
    :src="logoPath"
    :name="token.name"
  />
</template>
