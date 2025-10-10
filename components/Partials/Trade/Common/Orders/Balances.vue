<script lang="ts" setup>
import { Modal } from '@/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const modalStore = useSharedModalStore()

const selectedToken = ref<undefined | TokenStatic>(undefined)

function resetSelectedTrade() {
  selectedToken.value = undefined
}

function onShareToken(token: TokenStatic) {
  selectedToken.value = token
  modalStore.openModal(Modal.ShareBalancePnl)
}
</script>

<template>
  <PartialsPortfolioBalancesSubaccountTable @balance:share="onShareToken" />

  <ModalsSharePnlSpotBalance
    v-if="selectedToken"
    v-bind="{ token: selectedToken }"
    @on:close="resetSelectedTrade"
  />
</template>
