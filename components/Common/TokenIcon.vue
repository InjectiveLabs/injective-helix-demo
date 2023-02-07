<script lang="ts" setup>
import { PropType } from 'vue'
import {
  TokenMetaWithUsdPrice,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'

const props = defineProps({
  sm: Boolean,
  lg: Boolean,
  xl: Boolean,

  token: {
    type: Object as PropType<Token | TokenMetaWithUsdPrice>,
    required: true
  }
})

const logoPath = computed(() =>
  getTokenLogoWithVendorPathPrefix(props.token.logo)
)

const sizeClasses = computed(() => {
  if (props.sm) {
    return 'w-4 h-4 min-w-4'
  }

  if (props.lg) {
    return 'w-8 h-8 min-w-8'
  }

  if (props.xl) {
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
