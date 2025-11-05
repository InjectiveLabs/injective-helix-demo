<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedTokenStore = useSharedTokenStore()

const {
  activeSubaccountTotalBalanceInUsd,
  activeSubaccountPositionPnlDenomMap
} = useBalance()

const spotBalanceInUsd = computed(() =>
  new BigNumberInBase(activeSubaccountTotalBalanceInUsd.value).minus(
    marginAndPnl.value
  )
)

const marginAndPnl = computed(() =>
  Object.values(activeSubaccountPositionPnlDenomMap.value).reduce(
    (sum, { pnlPlusMargin, token }) => {
      const usdPrice = sharedTokenStore.tokenUsdPrice(token)
      const usdValue = sharedToBalanceInToken({
        decimalPlaces: token.decimals,
        value: new BigNumberInBase(pnlPlusMargin).times(usdPrice).toFixed()
      })

      return sum.plus(usdValue)
    },
    ZERO_IN_BASE
  )
)

const pnl = computed(() =>
  Object.values(activeSubaccountPositionPnlDenomMap.value).reduce(
    (sum, { pnl, token }) => {
      const usdPrice = sharedTokenStore.tokenUsdPrice(token)
      const usdValue = sharedToBalanceInToken({
        decimalPlaces: token.decimals,
        value: new BigNumberInBase(pnl).times(usdPrice).toFixed()
      })

      return sum.plus(usdValue)
    },
    ZERO_IN_BASE
  )
)

function onDeposit() {
  modalStore.openModal(Modal.Onboard)
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
      <p class="space-x-1">
        <SharedAmountUsd
          v-bind="{
            shouldAbbreviate: false,
            amount: spotBalanceInUsd
          }"
          class="text-white"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
        <span class="text-coolGray-450"> USD </span>
      </p>
    </div>

    <div class="flex items-center text-xs font-medium">
      <p class="text-coolGray-450">{{ $t('trade.equity.perps') }}</p>
      <div class="flex-1 mx-2" />
      <p class="space-x-1">
        <SharedAmountUsd
          v-bind="{
            amount: marginAndPnl,
            shouldAbbreviate: false
          }"
          class="text-white"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
        <span class="text-coolGray-450"> USD </span>
      </p>
    </div>

    <div class="flex items-center text-xs font-medium">
      <p class="text-coolGray-450">{{ $t('trade.equity.unrealizedPnl') }}</p>
      <div class="flex-1 mx-2" />
      <p class="space-x-1">
        <SharedAmountUsd
          v-bind="{
            amount: pnl,
            shouldAbbreviate: false
          }"
          class="text-white"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
        <span class="text-coolGray-450"> USD </span>
      </p>
    </div>

    <AppButton
      v-bind="{
        variant: 'primary-outline'
      }"
      class="w-full"
      @click="onDeposit"
    >
      {{ $t('common.deposit') }}
    </AppButton>
  </div>
</template>
