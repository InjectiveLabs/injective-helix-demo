<script setup lang="ts">
import { Modal } from '@/types'

defineProps({
  hideBalances: {
    type: Boolean
  }
})

const walletStore = useWalletStore()
const modalStore = useModalStore()

const { aggregatedPortfolioBalances } = useBalance()

function handleCreateSubaccount() {
  modalStore.openModal({ type: Modal.CreateSubaccount })
}
</script>

<template>
  <div
    class="flex space-x-4 items-center mt-4 overflow-x-auto overflow-y-hidden"
  >
    <PartialsAccountSubaccountSelectorItem
      v-for="[subaccountId, balances] in Object.entries(
        aggregatedPortfolioBalances
      ).sort(([subaccountA], [subaccountB]) =>
        subaccountA.localeCompare(subaccountB)
      )"
      v-bind="{
        balances,
        subaccountId,
        hideBalances
      }"
      :key="`subaccount-${subaccountId}`"
    />

    <div v-if="!walletStore.isAuthzWalletConnected">
      <BaseIcon
        name="circle-plus"
        class="w-8 h-8 text-blue-500 cursor-pointer hover:text-opacity-80"
        @click="handleCreateSubaccount"
      />
    </div>
  </div>
</template>
