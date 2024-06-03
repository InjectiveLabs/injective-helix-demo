<script lang="ts" setup>
import { INJ_LOGO_URL } from '@shared/utils/constant'
import { TokenStatic } from '@injectivelabs/token-metadata'

const tokenStore = useTokenStore()

const props = defineProps({
  isSm: Boolean,
  isLg: Boolean,
  isXl: Boolean,

  denom: {
    type: String,
    default: ''
  },

  token: {
    type: Object as PropType<TokenStatic>,
    default: undefined
  }
})

const formattedToken = computed(() => {
  if (props.denom) {
    return tokenStore.tokenByDenomOrSymbol(props.denom)
  }

  return props.token
})

const logoPath = computed(() => {
  if (!formattedToken.value) {
    return INJ_LOGO_URL
  }

  return formattedToken.value.logo
})

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
    :name="formattedToken?.name"
  />
</template>
