<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { Modal } from '@/types'

const tokenStore = useTokenStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

const {
  activeSubaccountTotalBalanceInUsd,
  activeSubaccountPositionPnlDenomMap
} = useBalance()

const { valueToFixed: marginAndPnlToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    Object.values(activeSubaccountPositionPnlDenomMap.value).reduce(
      (sum, { pnlPlusMargin, token }) => {
        const usdPrice = tokenStore.tokenUsdPrice(token)
        const usdValue = sharedToBalanceInToken({
          value: new BigNumberInBase(pnlPlusMargin).times(usdPrice).toFixed(),
          decimalPlaces: token.decimals
        })

        return sum.plus(usdValue)
      },
      ZERO_IN_BASE
    )
  )
)

const { valueToFixed: pnlToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    Object.values(activeSubaccountPositionPnlDenomMap.value).reduce(
      (sum, { pnl, token }) => {
        const usdPrice = tokenStore.tokenUsdPrice(token)
        const usdValue = sharedToBalanceInToken({
          value: new BigNumberInBase(pnl).times(usdPrice).toFixed(),
          decimalPlaces: token.decimals
        })

        return sum.plus(usdValue)
      },
      ZERO_IN_BASE
    )
  )
)

const { valueToFixed: spotBalanceInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(activeSubaccountTotalBalanceInUsd.value).minus(
      marginAndPnlToFixed.value
    )
  )
)

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
            amount: spotBalanceInUsdToFixed
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
            amount: marginAndPnlToFixed
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
            amount: pnlToFixed
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
      class="w-full"
      @click="openDepositQRModal"
    >
      {{ $t('account.deposit') }}
    </AppButton>
  </div>
</template>
