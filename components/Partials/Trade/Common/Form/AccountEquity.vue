<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-ts'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

const { perpBalancesInUsd, spotTotalBalanceInUsd, positionTotalPNLInUsd } =
  useEquity()

const { valueToFixed: spotTotalBalanceInUsdToFixed } =
  useSharedBigNumberFormatter(spotTotalBalanceInUsd)

const { valueToFixed: perpBalancesInUsdToFixed } =
  useSharedBigNumberFormatter(perpBalancesInUsd)

const { valueToFixed: positionTotalPNLInUsdToFixed } =
  useSharedBigNumberFormatter(positionTotalPNLInUsd)

function openDepositQRModal() {
  if (sharedWalletStore.wallet === Wallet.Magic) {
    modalStore.openModal(Modal.FiatOnboard)

    return
  }

  modalStore.openModal(Modal.DepositQr)
}
</script>

<template>
  <div class="flex flex-col space-y-2 mt-6">
    <div class="text-xs font-semibold select-none">
      {{ $t('trade.equity.title') }}
    </div>

    <div class="flex items-center text-xs font-medium">
      <p class="text-coolGray-450">{{ $t('trade.equity.spot') }}</p>
      <div class="flex-1 mx-2" />
      <p class="font-mono space-x-1">
        $<AppUsdAmount
          v-bind="{
            amount: spotTotalBalanceInUsdToFixed
          }"
          class="text-white"
        />
        <span class="text-coolGray-450"> USD </span>
      </p>
    </div>

    <div class="flex items-center text-xs font-medium">
      <p class="text-coolGray-450">{{ $t('trade.equity.perps') }}</p>
      <div class="flex-1 mx-2" />
      <p class="font-mono space-x-1">
        $<AppUsdAmount
          v-bind="{
            amount: perpBalancesInUsdToFixed
          }"
          class="text-white"
        />
        <span class="text-coolGray-450"> USD </span>
      </p>
    </div>

    <div class="flex items-center text-xs font-medium">
      <p class="text-coolGray-450">{{ $t('trade.equity.unrealizedPnl') }}</p>
      <div class="flex-1 mx-2" />
      <p class="font-mono space-x-1">
        $<AppUsdAmount
          v-bind="{
            amount: positionTotalPNLInUsdToFixed
          }"
          class="text-white"
        />
        <span class="text-coolGray-450"> USD </span>
      </p>
    </div>

    <AppButton
      v-bind="{
        variant: 'primary-outline'
      }"
      class="text-white w-full font-medium text-base py-2.5 leading-4"
      @click="openDepositQRModal"
    >
      {{ $t('account.deposit') }}
    </AppButton>
  </div>
</template>
