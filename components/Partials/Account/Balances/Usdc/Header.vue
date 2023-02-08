<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { AccountBalance } from '@/types'

const props = defineProps({
  showUsdcBalances: Boolean,
  hideBalances: Boolean,

  aggregatedBalance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  usdPriceStatus: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})

const emit = defineEmits<{
  (e: 'drawer:toggle'): void
}>()

/* TODO - bank <> default trading account merge

const { valueToString: availableBalanceToString } = useBigNumberFormatter(
  computed(() => props.aggregatedBalance.balanceToBase),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToBigNumber: totalBalanceInBigNumber,
  valueToString: totalBalanceInString
} = useBigNumberFormatter(
  computed(() => props.aggregatedBalance.totalBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
) */

const { valueToString: totalBalanceInUsdToString } = useBigNumberFormatter(
  computed(() => props.aggregatedBalance.totalBalanceInUsd),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToBigNumber: bankBalanceInBigNumber,
  valueToString: bankBalanceInString
} = useBigNumberFormatter(
  computed(() => props.aggregatedBalance.bankBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToBigNumber: subaccountBalanceInBigNumber,
  valueToString: subaccountBalanceInString
} = useBigNumberFormatter(
  computed(() => props.aggregatedBalance.subaccountBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: reservedBalanceToString } = useBigNumberFormatter(
  computed(() => props.aggregatedBalance.reservedBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

function handleDrawerToggle() {
  emit('drawer:toggle')
}
</script>

<template>
  <tr
    class="border-b border-gray-700 hover:bg-gray-700 bg-transparent px-4 py-0 overflow-hidden h-14 gap-2 transition-all"
    :class="{
      'max-h-20': !showUsdcBalances,
      'max-h-screen': showUsdcBalances
    }"
  >
    <td class="pl-4">
      <div
        class="flex justify-start items-center gap-2 cursor-pointer"
        @click="handleDrawerToggle"
      >
        <CommonTokenIcon :token="aggregatedBalance.token" />

        <div class="flex justify-start gap-2 items-center">
          <span
            class="text-white font-bold tracking-wide text-sm h-auto flex items-center"
            data-cy="wallet-balance-token-symbol-table-data"
          >
            {{ aggregatedBalance.token.symbol }}
          </span>

          <BaseIcon
            v-if="aggregatedBalance"
            name="caret-down"
            class="h-6 w-6 transition duration-300 hover:text-blue-500 transform"
            :class="{
              'rotate-180': showUsdcBalances
            }"
          />
        </div>
      </div>
    </td>

    <!-- TODO - bank <> default trading account merge
    <td>
      <div class="flex justify-end" data-cy="wallet-balance-total-table-data">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="totalBalanceInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ totalBalanceInString }}
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>
    -->

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

    <!-- TODO - bank <> default trading account merge
    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ availableBalanceToString }}
        </span>
      </div>
    </td>
    -->

    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ reservedBalanceToString }}
        </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <AppSpinner v-if="usdPriceStatus.isLoading()" md />

        <span v-else-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }} USD
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ totalBalanceInUsdToString }} USD
        </span>
      </div>
    </td>

    <td></td>
  </tr>
</template>
