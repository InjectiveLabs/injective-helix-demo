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

const { valueToString: totalToString } = useSharedBigNumberFormatter(amount, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})
</script>

<template>
  <div class="flex p-2 text-xs">
    <div class="flex-1 p-2">
      {{ time }}
    </div>

    <div class="flex-1 p-2">
      {{ transferType }}
    </div>

    <div class="flex-1 p-2 flex items-center space-x-2">
      <CommonTokenIcon :token="transaction.token" />

      <span class="font-semibold">
        {{ transaction.token.symbol }}
      </span>
    </div>

    <div class="flex-1 p-2 flex items-center space-x-2 justify-end">
      <span class="font-mono">{{ totalToString }}</span>

      <span class="font-semibold text-coolGray-500">
        {{ transaction.token.symbol }}
      </span>
    </div>

    <div class="flex-1 p-2 font-mono">
      <PartialsWalletHistoryCommonAddress is-xs :address="transaction.sender">
        {{ formattedOrigin }}
      </PartialsWalletHistoryCommonAddress>
    </div>

    <div class="flex-1 p-2 font-mono">
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
