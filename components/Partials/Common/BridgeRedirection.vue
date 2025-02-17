<script lang="ts" setup>
import { getBridgeRedirectionUrl } from '@/app/utils/network'

const props = withDefaults(
  defineProps<{
    denom?: string
    symbol?: string
    isDeposit?: boolean
    isTransfer?: boolean
  }>(),
  {
    denom: '',
    symbol: '',
    isDeposit: true,
    isTransfer: false
  }
)

const redirectionLink = computed(() => {
  let link = getBridgeRedirectionUrl(props.isTransfer ? 'transfer' : '')

  if (props.denom) {
    link = `${link}&denom=${props.denom}`
  }

  if (props.symbol) {
    link = `${link}&symbol=${props.symbol}`
  }

  if (props.isTransfer) {
    link = `${link}&isTransfer=true`

    return link
  }

  if (!props.isDeposit) {
    link = `${link}&direction=withdrawal`
  }

  return link
})
</script>

<template>
  <NuxtLink :to="redirectionLink" target="_blank">
    <slot />
  </NuxtLink>
</template>
