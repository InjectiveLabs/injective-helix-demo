<script lang="ts" setup>
import { PropType } from 'vue'
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
  }
})

const isOpen = ref(false)

/* TODO - bank <> default trading account merge

const { valueToString: totalBalanceInUsdToString } = useBigNumberFormatter(
  computed(() => props.balance.totalBalanceInUsd),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: totalBalanceInString } = useBigNumberFormatter(
  computed(() => props.balance.totalBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)
*/

const { valueToString: bankBalanceInString } = useBigNumberFormatter(
  computed(() => props.balance.bankBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: subaccountBalanceInString } = useBigNumberFormatter(
  computed(() => props.balance.subaccountBalance),
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
    :class="{
      'max-h-20': !isOpen,
      'max-h-screen': isOpen
    }"
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

    <!-- TODO - bank <> default trading account merge
    <td class="no-padding">
      <div class="flex flex-col py-4">
        <div class="flex flex-col items-end gap-1">
          <div data-cy="wallet-balance-total-table-data">
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ totalBalanceInString }}
            </span>
          </div>

          <div>
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }} USD
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ totalBalanceInUsdToString }} USD
            </span>
          </div>
        </div>
      </div>
    </td>
    -->

    <td class="no-padding">
      <div class="flex flex-col py-4">
        <div class="flex flex-col items-end gap-1">
          <div data-cy="wallet-balance-bank-table-data">
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ bankBalanceInString }}
            </span>
          </div>

          <div>
            <span v-if="hideBalances" class="font-mono text-sm text-right">
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>

            <span v-else class="font-mono text-sm text-right">
              {{ subaccountBalanceInString }}
            </span>
          </div>
        </div>
      </div>
    </td>

    <td class="no-padding">
      <div class="flex items-center justify-end px-4">
        <BaseIcon name="chevron" class="text-blue-500 w-4 h-4 rotate-180" />
      </div>
    </td>
  </tr>
</template>
