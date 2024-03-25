<script lang="ts" setup>
import { BigNumberInWei, formatWalletAddress } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  DATE_TIME_DISPLAY,
  BIG_NUMBER_ROUND_HALF_UP_MODE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { UiSubaccountTransactionWithToken } from '@/types'

const { t } = useLang()

const props = defineProps({
  transaction: {
    required: true,
    type: Object as PropType<UiSubaccountTransactionWithToken>
  }
})

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
  <tr data-cy="wallet-history-table-row">
    <td class="h-12 font-mono pl-3">
      <span
        class="text-gray-400 text-xs"
        data-cy="wallet-history-time-table-data"
      >
        {{ time }}
      </span>
    </td>

    <td class="h-12 text-left">
      <span
        data-cy="wallet-history-operation-type-table-data"
        class="text-white text-xs"
      >
        {{ transferType }}
      </span>
    </td>

    <td class="h-12 text-left cursor-pointer">
      <div class="flex items-center justify-start">
        <div v-if="transaction.token">
          <CommonTokenIcon :token="transaction.token" is-md />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="wallet-history-asset-table-data"
          >
            {{ transaction.token.symbol }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-12 text-right font-mono">
      <AppNumber
        :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
        :number="amount"
        :rounding-mode="BIG_NUMBER_ROUND_HALF_UP_MODE"
        data-cy="wallet-history-amount-table-data"
      >
        <template #addon>
          <span class="text-xs text-gray-500">
            {{ transaction.token.symbol }}
          </span>
        </template>
      </AppNumber>
    </td>

    <td class="h-12 text-left font-mono">
      <PartialsActivityViewsWalletHistoryCommonAddress
        is-xs
        :address="transaction.sender"
        data-cy="wallet-history-sender-table-data"
      >
        {{ formattedOrigin }}
      </PartialsActivityViewsWalletHistoryCommonAddress>
    </td>

    <td class="h-12 text-left font-mono">
      <PartialsActivityViewsWalletHistoryCommonAddress
        is-xs
        :address="transaction.receiver"
        data-cy="wallet-history-receiver-table-data"
      >
        {{ formattedDestination }}
      </PartialsActivityViewsWalletHistoryCommonAddress>
    </td>

    <td class="text-right pr-3">
      <a
        :href="transaction.explorerLink"
        data-cy="wallet-history-explorer-link"
        target="_blank"
        class="text-blue-500 cursor-pointer pr-2 text-xs"
      >
        {{ $t('common.view') }}
      </a>
    </td>
  </tr>
</template>
