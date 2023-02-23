<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { AccountBalance, BusEvents, Modal } from '@/types'

const modalStore = useModalStore()

const props = defineProps({
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
  valueToString: totalBalanceInString,
  valueToBigNumber: totalBalanceInBigNumber
} = useBigNumberFormatter(
  computed(() => props.balance.totalBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

function handleOpenAssetDetailsModal() {
  useEventBus<AccountBalance>(BusEvents.AssetDetailsModalPayload).emit(
    props.balance
  )

  modalStore.openModal({
    type: Modal.AssetDetails,
    preventScroll: true
  })
}
</script>

<template>
  <tr
    class="border-b border-gray-700 last-of-type:border-b-transparent hover:bg-gray-700 bg-transparent overflow-hidden gap-2 transition-all"
    :data-cy="'wallet-balance-table-row-' + balance.token.symbol"
    @click="handleOpenAssetDetailsModal"
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
        </div>
      </div>
    </td>

    <td class="no-padding">
      <div class="flex flex-col py-4">
        <div class="flex flex-col items-end gap-1">
          <div data-cy="wallet-balance-total-table-data">
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

          <div>
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
        </div>
      </div>
    </td>
  </tr>
</template>
