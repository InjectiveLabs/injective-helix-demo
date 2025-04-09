<script setup lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { Modal, StrategyStatus } from '@/types'

const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useSharedNotificationStore()

const status = reactive(new Status(StatusType.Idle))

const hasActiveStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)

function transferToMain() {
  if (!hasActiveStrategy.value) {
    return
  }

  status.setLoading()

  const strategy = hasActiveStrategy.value

  // If the strategy is pending, we manually call the SC method to remove
  // the deposits instead of the executioner

  const action =
    strategy.state === StrategyStatus.Active
      ? accountStore.withdrawToMain.bind(accountStore)
      : gridStrategyStore.removeSubaccountDeposits.bind(gridStrategyStore, {
          subaccountIds: [accountStore.subaccountId],
          contractAddress: strategy.contractAddress
        })

  action()
    .then(() => {
      success({ title: t('common.success') })
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
  if (!accountHasBalances) {
    return
  }

  if (hasActiveStrategy.value) {
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
