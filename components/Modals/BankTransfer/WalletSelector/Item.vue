<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-base'
import { WalletOption } from '@/types'

const props = withDefaults(
  defineProps<{
    walletOption: WalletOption
  }>(),
  {}
)

const emits = defineEmits<{
  'wallet:selected': [wallet: Wallet]
}>()

function onWalletClicked() {
  if (props.walletOption.downloadLink) {
    return navigateTo(props.walletOption.downloadLink, {
      open: {
        target: '_blank'
      }
    })
  }

  emits('wallet:selected', props.walletOption.wallet)
}
</script>

<template>
  <div @click="onWalletClicked">
    <SharedIcon class="w-8 h-8" :name="`wallet/${walletOption.wallet}`" />
  </div>
</template>
