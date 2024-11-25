<script setup lang="ts">
import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, formatWalletAddress } from '@injectivelabs/utils'
import {
  DATE_TIME_DISPLAY,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { UiSubaccountTransactionWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    transaction: UiSubaccountTransactionWithToken
  }>(),
  {}
)

const { t } = useLang()

const formattedOrigin = computed(() =>
  formatWalletAddress(props.transaction.sender)
)

const formattedDestination = computed(() =>
  formatWalletAddress(props.transaction.receiver)
)

const amount = computed(() => {
  if (!props.transaction.amount) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.transaction.amount).toBase(
    props.transaction.token.decimals
  )
})

const transferType = computed(() => {
  if (
    props.transaction.sender.startsWith('0x') &&
    props.transaction.receiver.startsWith('0x')
  ) {
    return t('walletHistory.subaccountInternalTransferType')
  }

  if (props.transaction.sender.startsWith('0x')) {
    return t('walletHistory.subaccountWithdrawalType')
  }

  return t('walletHistory.subaccountDepositType')
})

const time = computed(() => {
  if (!props.transaction.timestamp) {
    return ''
  }

  return format(props.transaction.timestamp, DATE_TIME_DISPLAY)
})
</script>

<template>
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div class="flex px-2 py-4 justify-between">
      <p>{{ $t('trade.time') }}</p>
      <p>{{ time }}</p>
    </div>

    <div class="flex justify-between px-2 py-4">
      <p>{{ $t('trade.type') }}</p>
      <p>{{ transferType }}</p>
    </div>

    <div class="px-2 py-4 flex items-center justify-between">
      <p>{{ $t('trade.asset') }}</p>
      <div class="space-x-2 flex items-center">
        <CommonTokenIcon :token="transaction.token" />

        <span class="font-semibold">
          {{ transaction.token.symbol }}
        </span>
      </div>
    </div>

    <div class="px-2 py-4 flex items-center justify-between">
      <p>{{ $t('trade.total') }}</p>

      <p class="space-x-2">
        <span class="font-mono">
          <AppAmount
            v-bind="{
              amount: amount.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
        </span>

        <span class="font-semibold text-coolGray-500">
          {{ transaction.token.symbol }}
        </span>
      </p>
    </div>

    <div class="flex px-2 py-4 items-center justify-between">
      <p>{{ $t('walletHistory.transfers.origin') }}</p>

      <PartialsWalletHistoryCommonAddress is-xs :address="transaction.sender">
        {{ formattedOrigin }}
      </PartialsWalletHistoryCommonAddress>
    </div>

    <div class="flex px-2 pt-4 pb-2 items-center justify-between">
      <p>{{ $t('walletHistory.transfers.destination') }}</p>

      <PartialsWalletHistoryCommonAddress is-xs :address="transaction.receiver">
        {{ formattedDestination }}
      </PartialsWalletHistoryCommonAddress>
    </div>

    <!--
    <div class="flex items-center p-2 px-4 w-14">
      <a
        :href="transaction.explorerLink"
        target="_blank"
        class="text-blue-500 cursor-pointer pr-2 text-xs"
      >
        {{ $t('common.view') }}
      </a>
    </div>
    -->
  </div>
</template>
