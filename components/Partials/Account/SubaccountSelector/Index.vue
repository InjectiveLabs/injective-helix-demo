<script lang="ts" setup>
import { Modal } from '@/types'

defineProps({
  isHideBalances: Boolean
})

const walletStore = useWalletStore()
const modalStore = useModalStore()

const { aggregatedPortfolioBalances } = useBalance()

function onCreateSubaccount() {
  modalStore.openModal(Modal.CreateSubaccount)
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
        isHideBalances
      }"
      :key="`subaccount-${subaccountId}`"
    />

    <div v-if="!walletStore.isAuthzWalletConnected">
      <BaseIcon
        name="circle-plus"
        class="w-8 h-8 text-blue-500 cursor-pointer hover:text-opacity-80"
        @click="onCreateSubaccount"
      />
    </div>
  </div>
</template>
