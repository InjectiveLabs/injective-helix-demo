<script lang="ts" setup>
import { TokenStatic } from '@injectivelabs/sdk-ts'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()

const selectedToken = ref<TokenStatic | undefined>(undefined)

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
