<script lang="ts" setup>
import { PropType } from 'vue'
import { Token } from '@injectivelabs/token-metadata'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { AccountBalance, BridgeBusEvents } from '@/types'

const props = defineProps({
  hideActions: Boolean,
  hideBalances: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  usdPriceStatus: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})

const {
  valueToString: totalBalanceInUsdInString,
  valueToBigNumber: totalBalanceInUsdInBigNumber
} = useBigNumberFormatter(
  computed(() => props.balance.totalBalanceInUsd),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToString: bankBalanceInString,
  valueToBigNumber: bankBalanceInBigNumber
} = useBigNumberFormatter(
  computed(() => props.balance.totalBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToString: subaccountBalanceInString,
  valueToBigNumber: subaccountBalanceInBigNumber
} = useBigNumberFormatter(
  computed(() => props.balance.subaccountBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToString: reservedBalanceInString,
  valueToBigNumber: reservedBalanceInBigNumber
} = useBigNumberFormatter(
  computed(() => props.balance.reservedBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

function handleDepositClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Deposit).emit(
    props.balance.token
  )
}

function handleWithdrawClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Withdraw).emit(
    props.balance.token
  )
}
</script>

<template>
  <tr
    class="border-b border-gray-700 hover:bg-gray-700 bg-transparent px-4 py-0 overflow-hidden h-14 gap-2 transition-all max-h-20"
    :data-cy="'wallet-balance-table-row-' + balance.token.symbol"
  >
    <td class="pl-4 w-56">
      <slot name="tokenSymbol">
        <PartialsAccountBalancesRowTokenSymbol v-bind="{ balance }" />
      </slot>
    </td>

    <td>
      <div class="flex justify-end" data-cy="wallet-balance-wallet-table-data">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="bankBalanceInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ bankBalanceInString }}
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>

    <td>
      <div
        class="flex justify-end"
        data-cy="wallet-balance-trading-account-table-data"
      >
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="subaccountBalanceInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ subaccountBalanceInString }}
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="reservedBalanceInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ reservedBalanceInString }}
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <AppSpinner v-if="usdPriceStatus.isLoading()" md />

        <span v-else-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }} USD
        </span>

        <span
          v-else-if="totalBalanceInUsdInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ totalBalanceInUsdInString }} USD
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>

    <td v-if="hideActions" />
    <td v-else class="pr-4">
      <div class="flex items-center justify-end gap-4 col-start-2 col-span-2">
        <slot name="action">
          <PartialsAccountBalancesRowTradeLink :balance="balance" />

          <div
            class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
            data-cy="wallet-balance-deposit-link"
            @click="handleDepositClick"
          >
            <span class="text-blue-500 text-sm font-medium">
              {{ $t('account.deposit') }}
            </span>
          </div>

          <div
            class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
            data-cy="wallet-balance-withdraw-link"
            @click="handleWithdrawClick"
          >
            <span class="text-blue-500 text-sm font-medium">
              {{ $t('account.withdraw') }}
            </span>
          </div>
        </slot>
      </div>
    </td>
  </tr>
</template>
