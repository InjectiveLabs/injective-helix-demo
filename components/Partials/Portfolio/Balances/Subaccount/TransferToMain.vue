<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { Modal, StrategyStatus } from '@/types'

const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const strategy = computed(() =>
  gridStrategyStore.strategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)

function transferToMain() {
  if (!strategy.value) {
    return
  }

  status.setLoading()

  // If the strategy is pending, we manually call the SC method to remove
  // the deposits instead of the executioner

  const action =
    strategy.value.state === StrategyStatus.Removed
      ? accountStore.withdrawToMain.bind(accountStore)
      : gridStrategyStore.removeSubaccountDeposits.bind(gridStrategyStore, {
          subaccountIds: [accountStore.subaccountId],
          contractAddress: strategy.value.contractAddress
        })

  action()
    .then(() => {
      notificationStore.update({ title: t('toast.account.assetsTransferred') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

const accountHasBalances = computed(
  () =>
    accountStore.subaccountBalancesMap[accountStore.subaccountId]?.filter(
      (balance) =>
        new BigNumberInBase(balance.availableBalance)
          .dp(0, BigNumberInBase.ROUND_DOWN)
          .gt(0)
    ).length > 0
)

function handleClick() {
  if (!accountHasBalances.value) {
    return
  }

  if (strategy.value && strategy.value.state === StrategyStatus.Active) {
    modalStore.openModal(Modal.TransferToMainSubaccount)
  } else {
    transferToMain()
  }
}
</script>

<template>
  <AppButton
    size="xs"
    class="whitespace-nowrap w-full"
    :disabled="!accountHasBalances"
    v-bind="{ status }"
    @click="handleClick"
  >
    {{ $t('portfolio.balances.transferToMain') }}
  </AppButton>

  <ModalsSubaccountTransferToMainSubaccount />
</template>
