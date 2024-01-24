<script lang="ts" setup>
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { AccountBalance, Modal } from '@/types'

defineProps({
  isHideBalances: Boolean
})

const appStore = useAppStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()

const { aggregatedPortfolioBalances } = useBalance()

function onCreateSubaccount() {
  modalStore.openModal(Modal.CreateSubaccount)
}

const filteredSubaccounts = computed(() =>
  appStore.userState.preferences.showSubaccountsWithDust
    ? aggregatedPortfolioBalances.value
    : Object.entries(aggregatedPortfolioBalances.value).reduce(
        (subaccounts, [subaccount, balances]) => {
          const hasBalance = balances.some((balance) =>
            new BigNumberInBase(balance.accountTotalBalance)
              .dp(0, BigNumber.ROUND_DOWN)
              .gt(0)
          )

          if (hasBalance || subaccount === walletStore.defaultSubaccountId) {
            return { ...subaccounts, [subaccount]: balances }
          }

          return subaccounts
        },
        {} as Record<string, AccountBalance[]>
      )
)
</script>

<template>
  <div
    class="flex space-x-4 items-center mt-4 overflow-x-auto overflow-y-hidden"
  >
    <PartialsAccountSubaccountSelectorItem
      v-for="[subaccountId, balances] in Object.entries(
        filteredSubaccounts
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
