<script lang="ts" setup>
import { Modal } from '@/types'

defineProps({
  isHideBalances: Boolean
})

const modalStore = useModalStore()
const walletStore = useWalletStore()

const { aggregatedPortfolioBalances } = useBalance()

function onCreateSubaccount() {
  modalStore.openModal(Modal.CreateSubaccount)
}
</script>

<template>
  <div
    class="flex space-x-4 items-center mt-4 overflow-x-auto overflow-y-hidden"
  >
    <CommonSubaccountOptions>
      <template #default="{ subaccountOptions }">
        <PartialsAccountSubaccountSelectorItem
          v-for="{ value: subaccountId } in subaccountOptions"
          v-bind="{
            balances: aggregatedPortfolioBalances[subaccountId],
            subaccountId,
            isHideBalances
          }"
          :key="`subaccount-${subaccountId}`"
        />
      </template>
    </CommonSubaccountOptions>

    <div v-if="!walletStore.isAuthzWalletConnected">
      <BaseIcon
        name="circle-plus"
        class="w-8 h-8 text-blue-500 cursor-pointer hover:text-opacity-80"
        @click="onCreateSubaccount"
      />
    </div>
  </div>
</template>
