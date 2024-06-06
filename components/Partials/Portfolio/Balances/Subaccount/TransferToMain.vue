<script setup lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '~/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const hasActiveStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)

function transferToMain() {
  status.setLoading()

  accountStore
    .withdrawToMain()
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
