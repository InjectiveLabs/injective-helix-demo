<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { legacyWHDenoms } from '@/app/data/token'
import { AccountBalance, BusEvents, Modal } from '@/types'

const modalStore = useModalStore()

const props = defineProps({
  isHideBalances: Boolean,

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
  valueToString: accountTotalBalanceInUsdInString,
  valueToBigNumber: accountTotalBalanceInUsdInBigNumber
} = useBigNumberFormatter(
  computed(() => props.balance.accountTotalBalanceInUsd),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToString: accountTotalBalanceInString,
  valueToBigNumber: accountTotalBalanceInBigNumber
} = useBigNumberFormatter(
  computed(() => props.balance.accountTotalBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const legacyWHMarketDenom = computed(() =>
  legacyWHDenoms.find(
    (denom) => denom === (props.balance.token.denom as string)
  )
)

function openAssetDetailsModal() {
  useEventBus<AccountBalance>(BusEvents.AssetDetailsModalPayload).emit(
    props.balance
  )

  modalStore.openModal(Modal.AssetDetails, {
    preventScroll: true
  })
}
</script>

<template>
  <tr
    class="border-b border-gray-700 last-of-type:border-b-transparent hover:bg-gray-700 bg-transparent overflow-hidden gap-2 transition-all"
    :data-cy="'wallet-balance-table-row-' + balance.token.symbol"
    @click="openAssetDetailsModal"
  >
    <td class="no-padding">
      <div class="flex flex-col py-4 pl-4">
        <div class="flex justify-start items-center gap-2">
          <CommonTokenIcon :token="balance.token" />

          <div class="flex flex-col gap-1">
            <span
              class="text-white font-bold tracking-wide text-sm uppercase h-6 flex items-center"
              data-cy="wallet-balance-token-symbol-table-data"
            >
              {{ balance.token.symbol }}
            </span>
            <span class="text-gray-500 text-xs">
              {{ balance.token.name }}
            </span>
          </div>

          <PartialsLegacyWormholeTags
            v-if="legacyWHMarketDenom && accountTotalBalanceInBigNumber.gt(0)"
            is-action-required
          />
        </div>
      </div>
    </td>

    <td class="no-padding">
      <div class="flex flex-col py-4">
        <div class="flex flex-col items-end gap-1">
          <div data-cy="wallet-balance-total-table-data">
            <span v-if="isHideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>

            <span
              v-else-if="accountTotalBalanceInBigNumber.gt(0)"
              class="font-mono text-sm text-right"
            >
              {{ accountTotalBalanceInString }}
            </span>

            <span v-else> &mdash; </span>
          </div>

          <div>
            <AppSpinner v-if="usdPriceStatus.isLoading()" is-md />

            <span
              v-else-if="isHideBalances"
              class="font-mono text-sm text-right"
            >
              {{ HIDDEN_BALANCE_DISPLAY }} USD
            </span>

            <span
              v-else-if="accountTotalBalanceInUsdInBigNumber.gt(0)"
              class="font-mono text-sm text-right"
            >
              {{ accountTotalBalanceInUsdInString }} USD
            </span>

            <span v-else> &mdash; </span>
          </div>
        </div>
      </div>
    </td>
  </tr>
</template>
